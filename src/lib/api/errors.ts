interface ApiErrorPayload {
    message?: string;
    error?: string;
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
    return apiError?.response?.data?.message || apiError?.response?.data?.error || apiError?.message || fallback;
};

export const getApiStatusCode = (error: unknown): number | undefined => {
    const apiError = error as ApiErrorLike | null | undefined;
    return apiError?.response?.status;
};
