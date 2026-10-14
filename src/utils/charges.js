// Shared helper for the booking charges breakdown so the cart, summary and
// payment screens all show the exact same numbers. Mirrors the shape returned
// by GET /settings/charges.
export const DEFAULT_CHARGES = {
  platform_fee: 0,
  travelling_charge: 0,
  gst_percent: 0,
  rain_charge: 0,
  subscription_fee: 0,
};

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

/**
 * Compute the price breakdown from an item total and the charges config.
 *
 * Line items:
 *   - Item Total        -> the sum of selected services
 *   - Platform Fee      -> charges.platform_fee               (flat)
 *   - Travelling Charge -> charges.travelling_charge           (flat)
 *   - Rain Charge       -> options.rainCharge                  (see below)
 *   - GST               -> item total * gst_percent%           (on item value only)
 *   - Total Pay         -> item total + platform fee + travelling + rain + GST
 *                          - discount
 *
 * Rain charge is NOT taken from the settings config. On the backend it is applied
 * only for INSTANT bookings when it is actually raining at the location, so the
 * caller resolves it from the weather API (GET /weather/condition) and passes the
 * resolved amount as `options.rainCharge`. It defaults to 0 (e.g. the cart, monthly
 * bookings, or when it isn't raining), so it simply doesn't appear in those cases.
 */
export function computeCharges(itemTotal, charges = DEFAULT_CHARGES, options = {}) {
  const {
    discount = 0,
    rainCharge: rainChargeInput = 0,
    includeSubscriptionFee = false,
  } = options;

  const base = Number(itemTotal) || 0;
  const platformFee = Number(charges?.platform_fee) || 0;
  const travellingCharge = Number(charges?.travelling_charge) || 0;
  const rainCharge = Number(rainChargeInput) || 0;
  const gstPercent = Number(charges?.gst_percent) || 0;

  // One-time subscription fee — only charged to NON-members on monthly plans.
  // The caller sets includeSubscriptionFee accordingly.
  const subscriptionFee = includeSubscriptionFee
    ? Number(charges?.subscription_fee) || 0
    : 0;

  // GST on the item total only (matches backend GST calculation).
  const gst = round2((base * gstPercent) / 100);

  const total = Math.max(
    0,
    round2(
      base +
        platformFee +
        travellingCharge +
        rainCharge +
        subscriptionFee +
        gst -
        (Number(discount) || 0),
    ),
  );

  return {
    itemTotal: base,
    platformFee,
    travellingCharge,
    rainCharge,
    subscriptionFee,
    gstPercent,
    gst,
    total,
  };
}
