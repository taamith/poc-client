interface ApiErrorPayload {
    message?: string;
    error?: string;
    details?: string;
    debug?: string | null;
}

interface ApiErrorLike {
    message?: string;
    response?: {
        data?: ApiErrorPayload;
        status?: number;
    };
}

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
    const apiError = error as ApiErrorLike | null | undefined;
    const status = apiError?.response?.status;
    const payload = apiError?.response?.data;
    const baseMessage = payload?.message || payload?.error || apiError?.message || fallback;
    const details = payload?.details || payload?.debug;

    if (!details) {
        return status ? `${baseMessage} (HTTP ${status})` : baseMessage;
    }

    const compactDetails = details.replace(/\s+/g, ' ').trim();
    const limitedDetails = compactDetails.length > 240 ? `${compactDetails.slice(0, 240)}...` : compactDetails;
    return status
        ? `${baseMessage} (HTTP ${status}): ${limitedDetails}`
        : `${baseMessage}: ${limitedDetails}`;
};

export const getApiStatusCode = (error: unknown): number | undefined => {
    const apiError = error as ApiErrorLike | null | undefined;
    return apiError?.response?.status;
};
