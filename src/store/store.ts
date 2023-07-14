import { StoreActions, StoreConfig, StoreGetter, StoreListener, StoreReducers, StoreSelectors } from './type';

import clone from 'clone';

const checkIsObject = (value: unknown): value is Record<string, any> => {
  return typeof value === 'object' && value !== null;
};

const findTarget = (obj: Record<string, any>, fullPath: string[]) => {
  let target: any = obj;

  for (const path of fullPath) {
    target = target[path as keyof typeof target];
  }

  return target;
};

const createMutableObject = <Obj>(obj: Obj, onChange?: (obj: Obj) => void, currentPath: string[] = []): Obj => {
  if (!checkIsObject(obj)) {
    return obj;
  }

  const target = findTarget(obj, currentPath);
  const memo = {} as typeof target;

  return new Proxy(target, {
    get: (target, key: string) => {
      const value = checkIsObject(target[key])
        ? memo[key] ? memo[key] : createMutableObject(obj, onChange, [ ...currentPath, key ])
        : target[key];

      memo[key] = value;

      return value;
    },
    set: (target, key, value) => {
      target[key] = value;
      onChange?.(obj);
      return true;
    },
  });
};

export const createStore = <State, Reducers extends StoreReducers<State>, Selectors extends StoreSelectors<State>>
(config: StoreConfig<State, Reducers, Selectors>) => {
  const {
    initialState,
    reducers,
    selectors,
  } = config;
  const listeners = new Set<StoreListener<State>>();
  const callListeners = (newState: State) => {
    listeners.forEach((listener) => listener(newState));
  };
  let state = clone(initialState);
  let mutableState = createMutableObject(state, callListeners);

  const syncSetState = (newState: State | void) => {
    if (!newState) {
      return;
    }
    const clonedState = clone(newState);
    callListeners(clonedState);
    state = clonedState;
    mutableState = createMutableObject(clonedState, callListeners);
  };

  const setState = (newState: State | Promise<State> | void | Promise<void>) => {
    if (newState instanceof Promise) {
      return newState.then((result) => {
        return syncSetState(result);
      });
    }

    syncSetState(newState);
  };
  const get = ((callback?: (state: State) => any) => {
    if (callback) {
      return callback(state);
    }

    return state;
  }) as StoreGetter<State, Selectors>;

  if (selectors) {
    for (const name of Object.keys(selectors) as (keyof Selectors)[]) {
      get[name] = (() => selectors[name](state)) as StoreGetter<State, Selectors>[keyof Selectors];
    }
  }

  const actions: StoreActions<State, Reducers> = {} as StoreActions<State, Reducers>;
  for (const name of Object.keys(reducers) as (keyof Reducers)[]) {
    actions[name] = ((payload?: any) => setState(reducers[name](mutableState, payload))) as any;
  }

  const subscribe = (listener: StoreListener<State>) => {
    listeners.add(listener);

    return function unsubscribe() {
      listeners.delete(listener);
    };
  };

  return {
    subscribe,
    get,
    actions,
  };
};
