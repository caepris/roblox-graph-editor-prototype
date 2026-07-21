import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_PARAMS, type ParamKey, type Params } from './types';

interface ParamsCtx {
  params: Params;
  setParam: (key: ParamKey, value: number) => void;
  reset: () => void;
}

export const ParamsContext = createContext<ParamsCtx>({
  params: DEFAULT_PARAMS,
  setParam: () => {},
  reset: () => {},
});

export function ParamsProvider({ children }: { children: ReactNode }) {
  const [params, setParams] = useState<Params>(DEFAULT_PARAMS);

  const setParam = useCallback((key: ParamKey, value: number) => {
    setParams((p) => ({ ...p, [key]: value }));
  }, []);

  const reset = useCallback(() => setParams(DEFAULT_PARAMS), []);

  const value = useMemo(() => ({ params, setParam, reset }), [params, setParam, reset]);

  return <ParamsContext.Provider value={value}>{children}</ParamsContext.Provider>;
}

export const useParams = () => useContext(ParamsContext);
