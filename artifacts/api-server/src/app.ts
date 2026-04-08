import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes";
import { logger } from "./lib/logger";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Resolve the frontend dist directory relative to the workspace root.
// In production the server is started from the workspace root, so we walk
// up from the compiled artifact to reach the macro-planner build output.
const frontendDist = path.resolve(
  __dirname,
  "..",   // artifacts/api-server/dist  →  artifacts/api-server
  "..",   // artifacts/api-server       →  artifacts
  "..",   // artifacts                  →  workspace root
  "artifacts",
  "macro-planner",
  "dist",
  "public",
);

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes — always takes priority
app.use("/api", router);

// Serve compiled frontend assets
app.use(express.static(frontendDist));

// SPA fallback — any route that doesn't match a static file gets index.html
app.get("/*splat", (_req, res) => {
  res.sendFile(path.join(frontendDist, "index.html"));
});

export default app;
