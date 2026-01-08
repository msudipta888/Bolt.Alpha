export async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, initialDelay = 1000): Promise<T> {
    let retries = 0;
    while (retries < maxRetries) {
        try {
            return await fn();
        } catch (error: any) {
            const isRateLimit = error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("Too Many Requests");
            if (isRateLimit && retries < maxRetries - 1) {
                const delay = initialDelay * Math.pow(2, retries);
                console.log(`Rate limit hit, retrying in ${delay}ms... (Attempt ${retries + 1}/${maxRetries})`);
                await new Promise((resolve) => setTimeout(resolve, delay));
                retries++;
                continue;
            }
            throw error;
        }
    }
    throw new Error("Max retries exceeded");
}

export function getErrorStatus(error: any): number {
    return error?.status || (error?.message?.includes("429") ? 429 : 500);
}
