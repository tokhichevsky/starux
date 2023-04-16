import { createStore, StoreConfig, StoreReducers, StoreSelector, StoreSelectors } from '../store';
import { useCallback, useEffect, useMemo, useState } from 'react';


export const createHookStore = <State, Reducers extends StoreReducers<State>, Selectors extends StoreSelectors<State>>
(config: StoreConfig<State, Reducers, Selectors>) => {
  const store = createStore(config);

  const useSelector = <Selector extends StoreSelector<State> | keyof Selectors>(selector?: Selector):
    Selector extends keyof Selectors
      ? ReturnType<Selectors[Selector]>
      : Selector extends StoreSelector<State>
        ? ReturnType<Selector>
        : State => {

    const select = useCallback((state: State) => {
      if (typeof selector === 'function') {
        return selector(state);
      } else if (typeof selector === 'string') {
        return store.get[selector]();
      }

      return state;
    }, [ selector ]);
    const [ result, setResult ] = useState(select(store.get()));

    const changeListener = useCallback((state: State) => {
      setResult(select(state));
    }, [ select ]);

    useEffect(() => {
      const unsubscribe = store.subscribe(changeListener);

      return () => {
        unsubscribe();
      };
    }, [ changeListener ]);

    return result as any;
  };

  const useActions = () => {
    return useMemo(() => store.actions, []);
  };

  const useSubscribe = (callback: (state: State) => void, deps?: any[]) => {
    useEffect(() => {
      const unsubscribe = store.subscribe(callback);

      return () => {
        unsubscribe();
      };
    }, deps ? deps : [ callback ]);
  };

  return {
    useActions,
    useSelector,
    useSubscribe,
    store,
  };
};
