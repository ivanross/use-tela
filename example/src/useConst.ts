import { useRef } from 'react';

const INIT = {};
export function useConst<T>(value: T | (() => T)) {
  const ref = useRef(INIT as T);
  if (ref.current === INIT) {
    ref.current = typeof value === 'function' ? (value as () => T)() : value;
  }

  return ref.current;
}
