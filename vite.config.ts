import { readFile } from "node:fs/promises";
import { defineConfig } from "vite";
import { pages } from "./src/config/pages.ts";

// Preview the same extensionless pages and slash rules as Workers Static Assets.
export default defineConfig({
  appType: "mpa",
  plugins: [{
    name: "preview-static-pages",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = new URL(req.url ?? "/", "http://localhost");
        if (pages.some(page => page.path === url.pathname.replace(/\/$/, "") || page.path === url.pathname)) {
          req.url = `/index.html${url.search}`;
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? "/", "http://localhost");
        const path = url.pathname.replace(/\/+$/, "") || "/";
        if (pages.some(page => page.path === path)) {
          if (path !== url.pathname) {
            res.writeHead(308, { Location: `${path}${url.search}` });
            res.end();
            return;
          }
          req.url = `${path === "/" ? "" : path}/index.html${url.search}`;
          next();
        } else if (!url.pathname.split("/").pop()?.includes(".")) {
          try {
            const body = await readFile(new URL("./dist/404.html", import.meta.url));
            res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
            res.end(req.method === "HEAD" ? undefined : body);
          } catch (error) {
            next(error as Error);
          }
        } else {
          next();
        }
      });
    },
  }],
});
