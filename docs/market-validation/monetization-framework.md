# Monetization Framework & Transaction Lifecycle

## 1. Principles of Monetization
1. **Never Tax Basic Discovery**: Access to all 33 districts, road status, public waterfall timings, and emergency safety guidelines is permanently free.
2. **Align With Economic Value Realization**: Operators are charged when customer discovery converts into a high-intent, validated traveler interaction.
3. **Idempotent Mobile Network Safety**: All commercial transactions mandate idempotency keys to safeguard rural providers on intermittent 3G/4G networks from duplicate charges.

## 2. Order Lifecycle State Machine
```
INITIATED -> CHECKOUT -> PAYMENT_PENDING -> PAID -> FULFILLED -> COMPLETED
   │            │              │
   ▼            ▼              ▼
CANCELLED   PAYMENT_FAILED   REFUNDED / PARTIALLY_REFUNDED
```

## 3. Order Economics & Contribution Equation
For every commercial order:
$$\text{Contribution Margin} = \text{Order Amount} - \text{Variable Cost} - \text{Refund Amount}$$
Variable costs include:
- Razorpay / UPI Gateway fee: 2.0%
- SMS & WhatsApp Cloud API: ₹0.15 / message
- Direct field verification stipend: ₹10 / verified listing audit.
