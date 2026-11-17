import { describe, expect, it } from "vitest";

import { getWhitespace, matchesName } from "better-tailwindcss:utils/utils.js";

import { escapeForRegex } from "../async-utils/escape";


describe("matchesName", () => {
  it("should match name", () => {
    expect(matchesName("class", "class")).toBe(true);
    expect(matchesName("data-attribute", "data-attribute")).toBe(true);
    expect(matchesName("custom_variable", "custom_variable")).toBe(true);
  });

  it("should not match partial matches", () => {
    expect(matchesName("class", "className")).toBe(false);
  });

  it("should match by regex", () => {
    expect(matchesName("class.*", "className")).toBe(true);
    expect(matchesName("class$", "class$")).toBe(false);
    expect(matchesName("class\\$", "class$")).toBe(true);
  });
});

describe("escapeForRegex", () => {
  it("should escape an user provided string to be used in a regular expression", () => {
    expect(escapeForRegex(".*")).toBe("\\.\\*");
    expect(escapeForRegex("hello?")).toBe("hello\\?");
    expect(escapeForRegex("[abc]")).toBe("\\[abc\\]");
    expect(escapeForRegex("a+b*c")).toBe("a\\+b\\*c");
    expect(escapeForRegex("class$")).toBe("class\\$");
  });
});

describe("getWhitespace", () => {

  it("should return the same whitespace as the \\s regex", () => {
    const inputs = ["", "   ", "a", " a ", "\n\t a b \u00A0\r\n", "\u2028a\uFEFF", "a  \n  b"];

    for(const input of inputs){
      expect(getWhitespace(input)).toEqual({
        leadingWhitespace: input.match(/^\s*/)?.[0],
        trailingWhitespace: input.match(/\s*$/)?.[0]
      });
    }
  });

});
