import { useState, useEffect, useCallback } from 'react';

interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

interface UseLoadingStateOptions {
  initialLoading?: boolean;
  minLoadingTime?: number; // Minimum time to show loading state
  timeout?: number; // Maximum time before auto-hide
}

export const useLoadingState = (options: UseLoadingStateOptions = {}) => {
  const {
    initialLoading = false,
    minLoadingTime = 500,
    timeout = 10000
  } = options;

  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: initialLoading,
    message: undefined,
    progress: undefined
  });

  const [startTime, setStartTime] = useState<number | null>(null);

  // Auto-hide after timeout
  useEffect(() => {
    if (loadingState.isLoading && timeout > 0) {
      const timer = setTimeout(() => {
        setLoadingState(prev => ({ ...prev, isLoading: false }));
      }, timeout);

      return () => clearTimeout(timer);
    }
  }, [loadingState.isLoading, timeout]);

  const startLoading = useCallback((message?: string) => {
    setStartTime(Date.now());
    setLoadingState({
      isLoading: true,
      message,
      progress: undefined
    });
  }, []);

  const stopLoading = useCallback(() => {
    if (startTime) {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minLoadingTime - elapsed);
      
      if (remaining > 0) {
        setTimeout(() => {
          setLoadingState(prev => ({ ...prev, isLoading: false }));
        }, remaining);
      } else {
        setLoadingState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setLoadingState(prev => ({ ...prev, isLoading: false }));
    }
    setStartTime(null);
  }, [startTime, minLoadingTime]);

  const updateProgress = useCallback((progress: number, message?: string) => {
    setLoadingState(prev => ({
      ...prev,
      progress: Math.max(0, Math.min(100, progress)),
      message: message || prev.message
    }));
  }, []);

  const updateMessage = useCallback((message: string) => {
    setLoadingState(prev => ({
      ...prev,
      message
    }));
  }, []);

  const withLoading = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    loadingMessage?: string
  ): Promise<T> => {
    try {
      startLoading(loadingMessage);
      const result = await asyncFn();
      return result;
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  return {
    isLoading: loadingState.isLoading,
    message: loadingState.message,
    progress: loadingState.progress,
    startLoading,
    stopLoading,
    updateProgress,
    updateMessage,
    withLoading
  };
};

// Hook for async operations with loading states
export const useAsyncLoading = <T,>(
  asyncFn: () => Promise<T>,
  deps: React.DependencyList = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const loading = useLoadingState({ minLoadingTime: 300 });

  const execute = useCallback(async () => {
    try {
      loading.startLoading();
      setError(null);
      const result = await asyncFn();
      setData(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      loading.stopLoading();
    }
  }, [asyncFn, loading]);

  useEffect(() => {
    execute();
  }, deps);

  return {
    data,
    error,
    isLoading: loading.isLoading,
    message: loading.message,
    progress: loading.progress,
    refetch: execute
  };
};

// Hook for multiple loading states
export const useMultiLoading = (keys: string[]) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, LoadingState>>(
    keys.reduce((acc, key) => ({ ...acc, [key]: { isLoading: false } }), {})
  );

  const setLoading = useCallback((key: string, state: Partial<LoadingState>) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: { ...prev[key], ...state }
    }));
  }, []);

  const startLoading = useCallback((key: string, message?: string) => {
    setLoading(key, { isLoading: true, message });
  }, [setLoading]);

  const stopLoading = useCallback((key: string) => {
    setLoading(key, { isLoading: false, message: undefined, progress: undefined });
  }, [setLoading]);

  const isAnyLoading = Object.values(loadingStates).some(state => state.isLoading);
  const loadingMessages = Object.entries(loadingStates)
    .filter(([, state]) => state.isLoading)
    .map(([key, state]) => state.message || key);

  return {
    loadingStates,
    isAnyLoading,
    loadingMessages,
    startLoading,
    stopLoading,
    setLoading
  };
};
