import { config } from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { type Server } from "node:http";

// Load .env.local file for local development (Windows & Unix compatible)
// This loads DATABASE_URL, OAuth credentials, and other secrets
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env.local");
config({ path: envPath });

// Ensure critical environment variables are set
// When using cross-env in npm script: cross-env NODE_ENV=development PORT=8008 tsx server/index-dev.ts
if (!process.env.PORT) {
  process.env.PORT = "8008";
}
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "development";
}

import type { Express } from "express";
import { nanoid } from "nanoid";
import { createServer as createViteServer, createLogger } from "vite";

import runApp from "./app";

import viteConfig from "../vite.config";

const viteLogger = createLogger();

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

(async () => {
  await runApp(setupVite);
})();
