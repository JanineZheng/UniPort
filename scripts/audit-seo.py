#!/usr/bin/env python3
"""Read-only public HTML audit. Uses system curl with normal TLS verification.
Does not execute JavaScript or send analytics. No Google indexing claims.
"""
import argparse
import collections
import datetime
import json
import pathlib
import subprocess
import urllib.parse
import urllib.robotparser
import xml.etree.ElementTree as ET
from html.parser import HTMLParser


class Document(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title = ''
        self.headings = []
        self.meta = {}
        self.canonical = []
        self.links = []
        self.schemas = []
        self.current = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in ('title', 'h1'):
            self.current = (tag, '')
        if tag == 'meta':
            self.meta[attrs.get('name', attrs.get('property', ''))] = attrs.get('content', '')
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonical.append(attrs.get('href'))
        if tag == 'a':
            self.links.append(attrs.get('href', ''))
        if tag == 'script' and attrs.get('type') == 'application/ld+json':
            self.current = ('schema', '')

    def handle_data(self, data):
        if self.current:
            self.current = (self.current[0], self.current[1] + data)

    def handle_endtag(self, tag):
        if not self.current:
            return
        kind, content = self.current
        if kind == tag or (kind == 'schema' and tag == 'script'):
            if kind == 'title':
                self.title = content.strip()
            elif kind == 'h1':
                self.headings.append(content.strip())
            else:
                try:
                    self.schemas.append(json.loads(content))
                except ValueError:
                    self.schemas.append({'parse_error': True})
            self.current = None


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--origin', default='https://uniport.janine-cheng22.workers.dev')
    parser.add_argument('--output', required=True)
    args = parser.parse_args()
    origin = args.origin.rstrip('/')
    parsed = urllib.parse.urlsplit(origin)
    if parsed.scheme != 'https' or parsed.path or parsed.query or parsed.fragment or parsed.username:
        parser.error('--origin must be an HTTPS origin')
    out = pathlib.Path(args.output).resolve()
    out.mkdir(parents=True, exist_ok=True)

    def fetch(path, name):
        body = out / (name + '.html')
        headers = out / (name + '.headers.txt')
        result = subprocess.run(['curl', '--silent', '--show-error', '--location', '--max-redirs', '3', '--max-time', '25',
                                 '--proto', '=https', '--proto-redir', '=https', '-D', str(headers), '-o', str(body),
                                 '-w', '%{http_code}\n%{url_effective}', origin + path], capture_output=True, text=True)
        if result.returncode:
            raise RuntimeError(result.stderr.strip())
        status, effective = result.stdout.split('\n', 1)
        return int(status), effective, body.read_text(), headers.read_text()

    report = {'checked_at_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'origin': origin,
              'method': 'public raw HTTPS HTML; no JavaScript or analytics', 'blockers': [], 'pages': []}
    status, _, robots_text, _ = fetch('/robots.txt', 'robots')
    robot = urllib.robotparser.RobotFileParser()
    robot.parse(robots_text.splitlines())
    report['robots'] = {'status': status, 'body': robots_text}
    status, _, sitemap, headers = fetch('/sitemap.xml', 'sitemap')
    report['sitemap'] = {'status': status, 'xml_content_type': 'xml' in headers.lower()}
    urls = [el.text for el in ET.fromstring(sitemap).iter() if el.tag.endswith('}loc') or el.tag == 'loc']
    if not urls or len(urls) > 100:
        raise RuntimeError('Unexpected sitemap size')
    report['sitemap']['url_count'] = len(urls)
    if status != 200:
        report['blockers'].append('sitemap HTTP status')
    for i, url in enumerate(urls):
        address = urllib.parse.urlsplit(url)
        if address.scheme != parsed.scheme or address.netloc != parsed.netloc:
            raise RuntimeError('Sitemap contains a different origin')
        path = address.path or '/'
        status, effective, html, headers = fetch(path, f'page-{i:02}')
        doc = Document()
        doc.feed(html)
        entry = {'path': path, 'status': status, 'effective_url': effective, 'title': doc.title,
                 'description': doc.meta.get('description', ''), 'h1': doc.headings, 'canonical': doc.canonical,
                 'json_ld': doc.schemas, 'raw_html_bytes': len(html.encode()),
                 'robots_googlebot_allowed': robot.can_fetch('Googlebot', url),
                 'internal_links': sorted(set(link for link in doc.links if link.startswith('/') and not link.startswith('//'))),
                 'blockers': []}
        if status != 200: entry['blockers'].append('HTTP status')
        if not doc.title or not doc.meta.get('description'): entry['blockers'].append('missing metadata')
        if len(doc.headings) != 1: entry['blockers'].append('expected one static H1')
        if doc.canonical != [url]: entry['blockers'].append('canonical mismatch')
        if 'noindex' in doc.meta.get('robots', '').lower() or any('x-robots-tag:' in line.lower() and 'noindex' in line.lower() for line in headers.splitlines()):
            entry['blockers'].append('noindex')
        if not entry['robots_googlebot_allowed']: entry['blockers'].append('robots disallow')
        if not doc.schemas or any(s.get('parse_error') for s in doc.schemas): entry['blockers'].append('JSON-LD absent or invalid')
        report['pages'].append(entry)
        report['blockers'].extend(f'{path}: {issue}' for issue in entry['blockers'])
    for field in ['title', 'description']:
        duplicates = [value for value, count in collections.Counter(p[field] for p in report['pages']).items() if count > 1]
        if duplicates: report['blockers'].append(f'duplicate {field}')
    missing_status, _, _, _ = fetch('/unitport-audit-missing-page', 'not-found')
    report['not_found_status'] = missing_status
    if missing_status != 404: report['blockers'].append('unknown URL does not return 404')
    result = out / 'audit.json'
    result.write_text(json.dumps(report, ensure_ascii=False, indent=2))
    print(json.dumps({'report': str(result), 'pages': len(report['pages']), 'blockers': report['blockers']}, ensure_ascii=False))
    return int(bool(report['blockers']))


if __name__ == '__main__':
    raise SystemExit(main())
