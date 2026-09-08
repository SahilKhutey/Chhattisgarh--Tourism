export interface PublishProductCheck {
  partnerVerified: boolean;
  active: boolean;
  price: number;
  capacity: number;
}

export function canPublishProduct(check: PublishProductCheck): boolean {
  return (
    check.partnerVerified &&
    check.active &&
    Number.isFinite(check.price) &&
    check.price >= 0 &&
    Number.isInteger(check.capacity) &&
    check.capacity > 0
  );
}

export function availableCapacity(capacity: number, reserved: number): number {
  return Math.max(0, capacity - Math.max(0, reserved));
}

export function conversionRate(conversions: number, views: number): number {
  if (!views || views <= 0) return 0;
  return Number((conversions / views).toFixed(4));
}
