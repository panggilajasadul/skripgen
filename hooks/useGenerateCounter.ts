import { useState, useCallback } from 'react';
import useLocalStorage from './useLocalStorage';

type GenerateCounts = {
  [featureKey: string]: number;
};

const useGenerateCounter = (featureKey: string) => {
  const [counts, setCounts] = useLocalStorage<GenerateCounts>('scriptgen_generate_counts', {});

  const count = counts[featureKey] || 0;

  const increment = useCallback(() => {
    setCounts(prevCounts => ({
      ...prevCounts,
      [featureKey]: (prevCounts[featureKey] || 0) + 1,
    }));
  }, [featureKey, setCounts]);

  return { count, increment };
};

export default useGenerateCounter;
