import { useRef, useCallback, useEffect } from 'react';

type Fn = (...args: any[]) => any;

// 用于持久化函数
function usePersistFn(fn: (...args: any[]) => any): Fn {
  const ref = useRef<Fn>(() => {
    throw new Error('Cannot call an event handler while rendering. :)');
  });

  useEffect(() => {
    ref.current = fn;
  }, [fn]);

  const persistedFn = useCallback((...args: any) => ref.current(...args), []);

  return persistedFn;
}

export default usePersistFn;
