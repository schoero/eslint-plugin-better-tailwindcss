import { describe, expect, it } from "vitest";

import config from "better-tailwindcss:configs/config.js";


describe("configs", () => {
  const stylisticRules = Object.entries(config.rules).reduce<string[]>((acc, [name, rule]) => {
    if(rule.meta.docs.recommended && rule.meta.type === "layout"){
      acc.push(`${config.meta.name}/${name}`);
    }
    return acc;
  }, []);

  const correctnessRules = Object.entries(config.rules).reduce<string[]>((acc, [name, rule]) => {
    if(rule.meta.docs.recommended && rule.meta.type === "problem"){
      acc.push(`${config.meta.name}/${name}`);
    }
    return acc;
  }, []);

  describe("stylistic", () => {
    it("should only contain recommended stylistic rules", () => {
      expect(Object.keys(config.configs.stylistic.rules)).toEqual(stylisticRules);
    });
  });

  describe("correctness", () => {
    it("should only contain recommended correctness rules", () => {
      expect(Object.keys(config.configs.correctness.rules)).toEqual(correctnessRules);
    });
  });

  describe("recommended", () => {
    it("should contain all recommended rules", () => {
      expect(Object.keys(config.configs.recommended.rules)).toEqual([
        ...stylisticRules,
        ...correctnessRules
      ]);
    });
  });
});
