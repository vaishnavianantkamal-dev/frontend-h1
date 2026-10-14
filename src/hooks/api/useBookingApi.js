import { useState, useCallback } from "react";
import { bookingService } from "../../api/services/booking";

export function useBookingApi() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const createBooking = useCallback(async (payload) => {
        setLoading(true);
        setError(null);
        try {
            const response = await bookingService.createBooking(payload);
            setData(response);
            return response;
        } catch (err) {
            const message = err?.message || "Something went wrong while creating booking.";
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        createBooking,
        loading,
        error,
        data,
    };
}


