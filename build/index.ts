import { $ } from "better-tailwindcss:build/utils.js";
import { writeFile } from "node:fs/promises";

async function build(){
  const outDir = "lib"

  console.info("Building...")
  await $(`npx tsc --project tsconfig.build.json --outDir ${outDir}`)
  await $(`npx tsc-alias --outDir ${outDir}`)
  console.info("Build complete")
}

build().catch(console.error);