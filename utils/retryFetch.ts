//utils/retryFetch.ts
export const retryFetch = async (
    url: string,
    options: RequestInit = {},
    retries: number = 3
  ): Promise<Response> => {
    try {
      const response = await fetch(url, options);
      if (!response.ok && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return retryFetch(url, options, retries - 1);
      }
      return response;
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return retryFetch(url, options, retries - 1);
      }
      throw error;
    }
  };