import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { generateOpenApiYaml } from "../src/contracts/openapi.js";

const target = resolve(process.cwd(), "openapi.yaml");
const yaml = generateOpenApiYaml();
writeFileSync(target, yaml, "utf-8");
console.log(`[OpenAPI] Successfully generated ${target}`);
