export function scorePercent(score: number, maxScore: number): number {
  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}

export function scoreTone(score: number, maxScore: number): 'good' | 'warning' | 'critical' {
  const pct = scorePercent(score, maxScore);
  if (pct >= 80) return 'good';
  if (pct >= 50) return 'warning';
  return 'critical';
}
