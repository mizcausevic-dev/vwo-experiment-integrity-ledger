import { readFile } from "node:fs/promises";

export type IntegrityTier = "ROLL OUT" | "WATCH" | "REVIEW" | "STOP";

export interface Experiment {
  name: string;
  owner: string;
  audience: string;
  surface: string;
  businessCriticality: number;
  sampleHealth: number;
  statisticalConfidence: number;
  guardrailHealth: number;
  revenueAttributionClarity: number;
  qaCoverage: number;
  daysSinceDecision: number;
  conflictingMetricCount: number;
  rolloutBlastRadius: number;
  narrative: string;
  nextAction: string;
}

export interface ExperimentInput {
  generatedAt: string;
  organization: string;
  experiments: Experiment[];
}

export interface ScoredExperiment extends Experiment {
  integrityScore: number;
  rolloutRiskScore: number;
  tier: IntegrityTier;
  route: string;
}

export interface ExperimentLedger {
  generatedAt: string;
  organization: string;
  experiments: ScoredExperiment[];
  summary: {
    experimentCount: number;
    rolloutReadyCount: number;
    stopCount: number;
    weakestExperiment: string;
    meanIntegrityScore: number;
    primaryRecommendation: string;
  };
}

const clamp = (value: number, min = 0, max = 100): number => Math.min(max, Math.max(min, value));

export function classifyTier(integrityScore: number): IntegrityTier {
  if (integrityScore >= 84) return "ROLL OUT";
  if (integrityScore >= 70) return "WATCH";
  if (integrityScore >= 52) return "REVIEW";
  return "STOP";
}

export function scoreExperiment(experiment: Experiment): ScoredExperiment {
  const decisionFreshness = 100 - clamp(experiment.daysSinceDecision * 2.5);
  const conflictPenalty = clamp(experiment.conflictingMetricCount * 11);
  const blastRadiusPenalty = clamp(experiment.rolloutBlastRadius * 0.7);

  const integrityScore = Math.round(
    clamp(
      experiment.sampleHealth * 0.18 +
        experiment.statisticalConfidence * 0.18 +
        experiment.guardrailHealth * 0.18 +
        experiment.revenueAttributionClarity * 0.16 +
        experiment.qaCoverage * 0.12 +
        decisionFreshness * 0.06 +
        (100 - conflictPenalty) * 0.06 +
        (100 - blastRadiusPenalty) * 0.04 +
        experiment.businessCriticality * 0.02
    )
  );

  const rolloutRiskScore = 100 - integrityScore;
  const tier = classifyTier(integrityScore);
  const route =
    tier === "STOP"
      ? "Stop rollout until sample, guardrail, QA, and revenue-attribution evidence are repaired."
      : tier === "REVIEW"
        ? "Route to experiment review with conflicting metrics and rollout blast radius attached."
        : tier === "WATCH"
          ? "Allow constrained rollout with guardrail monitoring and post-launch rollback triggers."
          : "Ready for rollout with current sample, guardrail, attribution, and QA evidence.";

  return { ...experiment, integrityScore, rolloutRiskScore, tier, route };
}

export function buildLedger(input: ExperimentInput): ExperimentLedger {
  const experiments = input.experiments.map(scoreExperiment).sort((a, b) => a.integrityScore - b.integrityScore);
  const meanIntegrityScore = Math.round(
    experiments.reduce((sum, experiment) => sum + experiment.integrityScore, 0) / Math.max(experiments.length, 1)
  );
  const weakestExperiment = experiments[0]?.name ?? "No experiments";
  const rolloutReadyCount = experiments.filter((experiment) => experiment.tier === "ROLL OUT").length;
  const stopCount = experiments.filter((experiment) => experiment.tier === "STOP").length;

  return {
    generatedAt: input.generatedAt,
    organization: input.organization,
    experiments,
    summary: {
      experimentCount: experiments.length,
      rolloutReadyCount,
      stopCount,
      weakestExperiment,
      meanIntegrityScore,
      primaryRecommendation: `Fix ${weakestExperiment} first; it has the weakest experiment-integrity posture for rollout.`
    }
  };
}

export async function loadLedger(path: string): Promise<ExperimentLedger> {
  return buildLedger(JSON.parse(await readFile(path, "utf8")) as ExperimentInput);
}

export function renderMarkdown(ledger: ExperimentLedger): string {
  const rows = ledger.experiments
    .map(
      (experiment) =>
        `| ${experiment.name} | ${experiment.tier} | ${experiment.integrityScore} | ${experiment.surface} | ${experiment.sampleHealth}% | ${experiment.guardrailHealth}% | ${experiment.nextAction} |`
    )
    .join("\n");

  return [
    "# VWO Experiment Integrity Ledger",
    "",
    `Organization: ${ledger.organization}`,
    "",
    `Primary recommendation: ${ledger.summary.primaryRecommendation}`,
    "",
    "| Experiment | Tier | Integrity | Surface | Sample health | Guardrails | Next action |",
    "| --- | --- | ---: | --- | ---: | ---: | --- |",
    rows
  ].join("\n");
}
