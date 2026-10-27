import { useState } from 'react';
import { convert, format } from '../core/convert';
import { boxVolume, parseDimensions } from '../core/shipping';
import UnitSelect from './UnitSelect';
import Icon from './Icon';
export default function ShippingTool({ mode, zh, precision, copy }: { mode: 'cubic' | 'dimensions'; zh: boolean; precision: number; copy: (text: string) => void }) {
  const t = (cn: string, en: string) => zh ? cn : en;
  const [edges, setEdges] = useState(mode === 'cubic' ? ['24','18','12'] : ['25.4','50.8','76.2']);
  const [from, setFrom] = useState(mode === 'cubic' ? 'in' : 'cm');
  const [to, setTo] = useState('in');
  const [qty, setQty] = useState('2');
  const [paste, setPaste] = useState('25.4 × 50.8 × 76.2 cm');
  const [pasteError, setPasteError] = useState('');
  let result = '', cbm = '', error = '';
  try {
    if (mode === 'cubic') { const volume = boxVolume(edges, from, qty, precision); result = volume.cuft; cbm = volume.cbm; }
    else { result = edges.map(v => { const n = convert(v, from, to); if(n.n <= 0n) throw new Error('positive'); return format(n, precision); }).join(' × '); }
  } catch { error = t('请输入大于 0 的有效尺寸；箱数须为正整数。', 'Enter positive dimensions. Box quantity must be a positive whole number.'); }
  return <>
    <div className="example-row"><span>{t('试一试', 'Try an example')}</span><button onClick={() => { setEdges(mode === 'cubic' ? ['24','18','12'] : ['25.4','50.8','76.2']); setFrom(mode === 'cubic' ? 'in' : 'cm'); setTo('in'); setQty('2'); setPaste('25.4 × 50.8 × 76.2 cm'); setPasteError(''); }}>{mode === 'cubic' ? '24 × 18 × 12 in · 2 boxes ↗' : '25.4 × 50.8 × 76.2 cm ↗'}</button></div>
    {mode === 'dimensions' && <div className="paste-dimensions"><label className="field"><span>{t('直接粘贴长 × 宽 × 高（可带单位）', 'Paste L × W × H (optional unit)')}</span><input value={paste} onChange={e => setPaste(e.target.value)} /></label><button className="secondary" onClick={() => { try { const data = parseDimensions(paste); setEdges(data.values); if(data.unit) setFrom(data.unit); setPasteError(''); } catch {setPasteError(t('请使用 30 × 20 × 10 cm 这样的格式。', 'Use a format such as 30 × 20 × 10 cm.'));} }}>{t('填入尺寸', 'Use dimensions')}</button></div>}
    {pasteError && <p className="error" role="alert">{pasteError}</p>}
    <div className="box-form"><div className="edge-fields">{edges.map((v,i) => <label className="field" key={i}><span>{[t('长','Length'),t('宽','Width'),t('高','Height')][i]}</span><input inputMode="decimal" value={v} maxLength={100} onChange={e => setEdges(edges.map((old,j) => i === j ? e.target.value : old))} aria-invalid={!!error} /></label>)}</div><div className={mode === 'dimensions' ? "box-units pair-selectors" : "box-units"}><UnitSelect category="length" value={from} onChange={setFrom} label={t('尺寸单位','Dimension unit')} locale={zh ? 'zh' : 'en'} />{mode === 'cubic' ? <label className="field"><span>{t('相同箱子数量','Identical boxes')}</span><input value={qty} inputMode="numeric" maxLength={10} onChange={e => setQty(e.target.value)} /></label> : <><button className="pair-swap" aria-label={t('交换尺寸单位', 'Swap dimension units')} onClick={() => { setFrom(to); setTo(from); }}><Icon name="swap" /></button><UnitSelect category="length" value={to} onChange={setTo} label={t('结果单位','Result unit')} locale={zh ? 'zh' : 'en'} /></>}</div></div>
    {error && <p className="error" role="alert">{error}</p>}
    <div className="result-card shipping-result"><span className="mini-label">{mode === 'cubic' ? t('总体积','TOTAL BOX VOLUME') : t('长 × 宽 × 高','LENGTH × WIDTH × HEIGHT')}</span><div className="shipping-number" aria-live="polite">{error ? '—' : result} <small>{mode === 'cubic' ? 'ft³' : to}</small></div>{mode === 'cubic' && !error && <p>{cbm} m³ (CBM) · {qty} {t('个相同尺寸箱子','identical boxes')}</p>}<button className="primary" disabled={!!error} onClick={() => copy(mode === 'cubic' ? `${result} ft³ (${cbm} m³) — ${qty} boxes, ${edges.join(' × ')} ${from} each` : `Dimensions (L × W × H): ${result} ${to}`)}><Icon name="copy" /> {t('复制结果','Copy result')}</button></div>
    <p className="help">{mode === 'cubic' ? t('体积不是体积重；本工具不估算运费。多箱计算适用于相同尺寸的箱子。', 'Volume is not dimensional weight. This tool does not estimate shipping rates. Quantity applies to identical boxes.') : t('保留长 × 宽 × 高顺序，复制后可直接用于商品详情。','The L × W × H order stays the same. Copy the result into your product listing.')}</p>
  </>;
}
