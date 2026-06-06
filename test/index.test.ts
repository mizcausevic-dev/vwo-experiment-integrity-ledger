import { describe, expect, it } from "vitest";
import sample from "../fixtures/vwo-experiment-sample.json" with { type: "json" };
import { buildLedger, classifyTier, renderMarkdown, scoreExperiment } from "../src/index.js";

describe("vwo experiment integrity ledger", () => {
  it("classifies integrity tiers", () => {
    expect(classifyTier(90)).toBe("ROLL OUT");
    expect(classifyTier(76)).toBe("WATCH");
    expect(classifyTier(58)).toBe("REVIEW");
    expect(classifyTier(40)).toBe("STOP");
  });

  it("scores experiments from integrity evidence", () => {
    const experiment = scoreExperiment(sample.experiments[0]);
    expect(experiment.integrityScore).toBeLessThan(70);
    expect(experiment.route).toContain("rollout");
  });

  it("sorts weakest experiments first", () => {
    const ledger = buildLedger(sample);
    expect(ledger.summary.experimentCount).toBe(4);
    expect(ledger.experiments[0].integrityScore).toBeLessThanOrEqual(ledger.experiments[1].integrityScore);
    expect(ledger.summary.primaryRecommendation).toContain(ledger.summary.weakestExperiment);
  });

  it("renders markdown output", () => {
    const markdown = renderMarkdown(buildLedger(sample));
    expect(markdown).toContain("| Experiment | Tier | Integrity |");
    expect(markdown).toContain("Checkout urgency banner");
  });
});
