import { StoreActions, StoreConfig, StoreGetter, StoreListener, StoreReducers, StoreSelectors } from './type';

import clone from 'clone';

const checkIsObject = (value: unknown): value is Record<string, any> => {
  return typeof value === 'object' && value !== null;
};

const createMutableObject = <Obj>(target: Obj, onChange?: (obj: Obj) => void): Obj => {
  if (!checkIsObject(target)) {
    return target;
  }
  type NewTarget = Obj[keyof Obj];

  const memo = {} as Obj;

  const getChangeHandler = (key: keyof Obj) => (obj: NewTarget) => {
    target[key] = obj as any;
    onChange?.(target);
  };

  return new Proxy(target, {
    get: (target, _key) => {
      const key = _key as keyof Obj;
      const value = checkIsObject(target[key])
        ? memo[key]
          ? memo[key]
          : createMutableObject<NewTarget>(target[key], getChangeHandler(key))
        : target[key]
      memo[key] = value;

      return value;
    },
    set: (target, _key, value) => {
      const key = _key as keyof Obj;
      target[key] = value;
      getChangeHandler(key)(value);
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
