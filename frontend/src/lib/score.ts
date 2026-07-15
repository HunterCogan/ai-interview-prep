export function scoreBadgeVariant(score: number) {
  if (score >= 8) return 'default'
  if (score >= 5) return 'secondary'
  return 'destructive'
}
