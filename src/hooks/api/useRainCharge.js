import { useState, useEffect } from "react";
import { weatherService } from "../../api/services/weather";

/**
 * Resolve the rain charge for a booking location from the weather API.
 *
 * The backend applies a rain charge only for INSTANT bookings when it is
 * actually raining at the location, so this hook should be enabled only for
 * instant bookings. When it isn't raining the weather endpoint returns
 * `rain_charge: 0`, so the charge naturally disappears.
 *
 * @param {object}  params
 * @param {number|string|null} params.lat
 * @param {number|string|null} params.long
 * @param {boolean} params.enabled  fetch only when true (e.g. instant bookings)
 * @returns {{ rainCharge: number, isRaining: boolean, loading: boolean }}
 */
export function useRainCharge({ lat, long, enabled }) {
  const [rainCharge, setRainCharge] = useState(0);
  const [isRaining, setIsRaining] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || lat == null || long == null || lat === "" || long === "") {
      setRainCharge(0);
      setIsRaining(false);
      return;
    }

    let active = true;
    setLoading(true);
    weatherService
      .getCondition(lat, long)
      .then((res) => {
        if (!active) return;
        const data = res?.data || {};
        setIsRaining(Boolean(data.is_raining));
        setRainCharge(Number(data.rain_charge) || 0);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Failed to resolve weather condition:", err);
        setRainCharge(0);
        setIsRaining(false);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [lat, long, enabled]);

  return { rainCharge, isRaining, loading };
}
