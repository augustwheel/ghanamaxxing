// MapLibre finds its web worker relative to its own module, which breaks once the bundler moves it.
// We serve the worker from /public instead (see components/map/launch-map.tsx). Runs on install.
import { copyFileSync, mkdirSync } from "node:fs";

mkdirSync("public/maplibre", { recursive: true });
copyFileSync("node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs", "public/maplibre/maplibre-gl-worker.mjs");
