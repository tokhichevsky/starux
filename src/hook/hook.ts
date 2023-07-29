import { createStore, StoreConfig, StoreReducers, StoreSelector, StoreSelectors } from '../store';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { shallowEqual } from './equal.util';
import clone from 'clone';


export const createHookStore = <State, Reducers extends StoreReducers<State>, Selectors extends StoreSelectors<State>>
(config: StoreConfig<State, Reducers, Selectors>) => {
  const store = createStore(config);

  type SelectReturnType<Selector extends StoreSelector<State> | keyof Selectors> = Selector extends keyof Selectors
    ? ReturnType<Selectors[Selector]>
    : Selector extends StoreSelector<State>
      ? ReturnType<Selector>
      : State

  const useSelector = <Selector extends StoreSelector<State> | keyof Selectors>
  (
    selector?: Selector,
    compare: (value1: SelectReturnType<Selector>, value2: SelectReturnType<Selector>) => boolean = shallowEqual,
  ):
    SelectReturnType<Selector> => {

    const select = useCallback((state: State) => {
      if (typeof selector === 'function') {
        return selector(state);
      } else if (typeof selector === 'string') {
        return store.get[selector]();
      }

      return state;
    }, [ selector ]);
    const [ result, setResult ] = useState(clone(select(store.get())));

    const changeListener = useCallback((state: State) => {
      const newResult = select(state);
      setResult((prevResult: any) => {
        return compare(newResult, prevResult) ? prevResult : clone(newResult);
      });
    }, [ select ]);

    useEffect(() => {
      const unsubscribe = store.subscribe(changeListener);

      return () => {
        unsubscribe();
      };
    }, [ changeListener ]);

    return result;
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
