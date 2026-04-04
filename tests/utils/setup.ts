import { cleanUpTestDirectory } from "better-tailwindcss:tests/utils/tmp.js";


export function teardown() {
  cleanUpTestDirectory();
}
