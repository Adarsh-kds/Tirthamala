import { describe, expect, it } from "vitest";
import { t } from "./i18n";

describe("t", () => {
  it("returns the English string for a key", () => {
    expect(t("a11y.skipToContent")).toBe("Skip to content");
  });
});
