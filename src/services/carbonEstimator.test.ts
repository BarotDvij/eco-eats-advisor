import { describe, it, expect, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: () => ({ select: async () => ({ data: null, error: "offline" }) }) },
}));

import { estimateCarbon } from "./carbonEstimator";

describe("estimateCarbon (offline fallback factors)", () => {
  it("rates beef far worse than lentils and keeps percentages summing to 100", async () => {
    const beef = await estimateCarbon({ code: "1", categories_tags: ["en:beef"], origins: "Brazil" });
    const lentils = await estimateCarbon({ code: "2", categories_tags: ["en:lentils"], origins: "United Kingdom" });

    expect(beef.appCategory).toBe("meat");
    expect(lentils.appCategory).toBe("legumes");
    expect(beef.totalCo2ePerKg).toBeGreaterThan(lentils.totalCo2ePerKg * 10);
    expect(beef.impactScore).toBeGreaterThan(lentils.impactScore);
    for (const e of [beef, lentils]) {
      expect(e.ingredientPct + e.transportPct + e.packagingPct).toBe(100);
      expect(e.impactScore).toBeGreaterThanOrEqual(1);
      expect(e.impactScore).toBeLessThanOrEqual(10);
    }
  });
});
