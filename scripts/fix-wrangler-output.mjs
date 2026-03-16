import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const wranglerPath = resolve("dist/server/wrangler.json");

const config = JSON.parse(readFileSync(wranglerPath, "utf-8"));

delete config.triggers;
config.kv_namespaces = [];
if (config.assets?.binding === "ASSETS") {
  config.assets = { directory: config.assets.directory };
}
delete config.definedEnvironments;
delete config.images;
delete config.secrets_store_secrets;
delete config.unsafe_hello_world;
delete config.worker_loaders;
delete config.ratelimits;
delete config.vpc_services;
delete config.python_modules;
if (config.dev) {
  delete config.dev.enable_containers;
  delete config.dev.generate_types;
}

writeFileSync(wranglerPath, JSON.stringify(config, null, 2));
console.log("Fixed wrangler.json for Cloudflare Pages compatibility");
