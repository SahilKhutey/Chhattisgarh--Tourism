export interface RefundPolicy {
  fullRefundHours: number;
  partialRefundHours: number;
  partialRefundPercent: number;
}

export interface RefundQuote {
  grossAmount: number;
  hoursBeforeStart: number;
  refundPercent: number;
  refundAmount: number;
  refundType: 'FULL' | 'PARTIAL' | 'NONE';
}

export const DEFAULT_REFUND_POLICY: RefundPolicy = {
  fullRefundHours: 48,
  partialRefundHours: 24,
  partialRefundPercent: 50,
};

export function calculateRefund(
  amount: number,
  hoursBeforeStart: number,
  policy?: Partial<RefundPolicy>,
): RefundQuote {
  const p: RefundPolicy = {
    fullRefundHours: policy?.fullRefundHours ?? DEFAULT_REFUND_POLICY.fullRefundHours,
    partialRefundHours: policy?.partialRefundHours ?? DEFAULT_REFUND_POLICY.partialRefundHours,
    partialRefundPercent: policy?.partialRefundPercent ?? DEFAULT_REFUND_POLICY.partialRefundPercent,
  };

  const grossAmount = Math.max(0, Number(amount.toFixed(2)));

  if (grossAmount <= 0 || hoursBeforeStart < p.partialRefundHours) {
    return {
      grossAmount,
      hoursBeforeStart,
      refundPercent: 0,
      refundAmount: 0,
      refundType: 'NONE',
    };
  }

  if (hoursBeforeStart >= p.fullRefundHours) {
    return {
      grossAmount,
      hoursBeforeStart,
      refundPercent: 100,
      refundAmount: grossAmount,
      refundType: 'FULL',
    };
  }

  const refundAmount = Number(
    (grossAmount * (p.partialRefundPercent / 100)).toFixed(2),
  );

  return {
    grossAmount,
    hoursBeforeStart,
    refundPercent: p.partialRefundPercent,
    refundAmount,
    refundType: 'PARTIAL',
  };
}
