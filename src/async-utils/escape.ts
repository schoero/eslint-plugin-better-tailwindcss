import { getCachedRegex } from "./regex.js";


export function escapeForRegex(word: string) {
  return word.replace(getCachedRegex(/[$()*+./?[\\\]^{|}-]/g), "\\$&");
}
