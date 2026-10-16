import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { generateOpenApiYaml } from "./openapi.js";

const outputPath = resolve(process.cwd(), "openapi.yaml");
const yamlContent = generateOpenApiYaml();

writeFileSync(outputPath, yamlContent, "utf-8");
console.log(`[contracts] Generated openapi.yaml at ${outputPath}`);
