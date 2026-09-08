export interface CommissionCalculation {
  grossAmount: number;
  commissionRate: number;
  commissionAmount: number;
  partnerAmount: number;
}

export function calculateCommission(
  grossAmount: number,
  commissionRate: number,
): CommissionCalculation {
  if (!Number.isFinite(commissionRate) || commissionRate < 0 || commissionRate > 100) {
    throw new Error('Commission rate must be a number between 0 and 100');
  }
  if (!Number.isFinite(grossAmount) || grossAmount < 0) {
    throw new Error('Gross amount must be a positive number');
  }

  const commissionAmount = Number(
    (grossAmount * (commissionRate / 100)).toFixed(2),
  );
  const partnerAmount = Number((grossAmount - commissionAmount).toFixed(2));

  return {
    grossAmount: Number(grossAmount.toFixed(2)),
    commissionRate: Number(commissionRate.toFixed(2)),
    commissionAmount,
    partnerAmount,
  };
}
