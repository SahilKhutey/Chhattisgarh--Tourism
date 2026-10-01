let sequence = 0;

export function createUIId(
  prefix = "cg-ui",
): string {
  sequence += 1;

  return `${prefix}-${sequence}`;
}

export function resetUIIdSequence(): void {
  sequence = 0;
}
