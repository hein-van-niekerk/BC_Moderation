import { Test, Module } from './data';

// Simple heuristics to compute status and estimate NQF
export function computeDifficultyDistribution(test: Test) {
  const totals: Record<string, number> = { Recall: 0, Comprehension: 0, Application: 0, Analysis: 0, Evaluation: 0, Creation: 0 };
  let totalMarks = 0;
  for (const q of test.questions) {
    totals[q.blooms] = (totals[q.blooms] || 0) + q.marks;
    totalMarks += q.marks;
  }
  const percents: Record<string, number> = {};
  for (const k of Object.keys(totals)) {
    percents[k] = totalMarks ? Math.round((totals[k] / totalMarks) * 100) : 0;
  }
  return { totals, percents, totalMarks };
}

export function estimateNqfFromTest(test: Test) {
  //higher-order blooms -> higher NQF
  const weights: Record<string, number> = { Recall: 1, Comprehension: 2, Application: 3, Analysis: 4, Evaluation: 5, Creation: 6 };
  let score = 0;
  let marks = 0;
  for (const q of test.questions) {
    score += weights[q.blooms] * q.marks;
    marks += q.marks;
  }
  if (!marks) return 5;
  const avg = score / marks;
  if (avg < 2) return 5;
  if (avg < 3.5) return 6;
  return 7;
}

export function compareModuleTest(module: Module, test: Test) {
  const est = estimateNqfFromTest(test);
  return { moduleNqf: module.nqfLevel, estimatedTestNqf: est };
}

export function computeStatus(module: Module, test: Test) {
  const { percents, totalMarks } = computeDifficultyDistribution(test);
  // conditions: empty topics -> Action Needed
  const topics = new Set(test.questions.map(q => q.topic));
  if (topics.size === 0 || totalMarks === 0) return 'Action Needed';
  // imbalanced: if any single bloom > 70% -> Attention
  for (const v of Object.values(percents)) {
    if (v > 70) return 'Attention Needed';
  }
  // if estimated NQF lower than module by >0 -> Attention
  const est = estimateNqfFromTest(test);
  if (est < module.nqfLevel) return 'Attention Needed';
  return 'Sufficient';
}
