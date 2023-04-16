// export type SimpleReducer<State> = (state: State) => State | Promise<State> | void | Promise<void>;
// export type PayloadReducer<State, Payload> = (state: State, payload: Payload) => State | Promise<State> | void | Promise<void>;
// export type StoreReducer<State> = SimpleReducer<State> | PayloadReducer<State, any>;
export type StoreReducer<State> = (state: State, ...args: any[]) => State | Promise<State> | void | Promise<void>;

export type StoreSelector<State, Return = any> = (state: State) => Return;

export type StoreReducers<State> = Record<string, StoreReducer<State>>
export type StoreSelectors<State> = Record<string, StoreSelector<State>>

export type StoreConfig<State, Reducers extends StoreReducers<State>, Selectors extends StoreSelectors<State>> = {
  initialState: State;
  reducers: Reducers;
  selectors?: Selectors;
}

export type GetStoreSelectorGetter<Selector extends StoreSelector<any>> = () => Selector extends StoreSelector<any, infer Return> ? Return : never;
export type StoreGetter<State, Selectors extends StoreSelectors<State>> =
  ((<Return = State>(selector?: StoreSelector<Return>) => Return) |
    (() => State)) & { [key in keyof Selectors]: GetStoreSelectorGetter<Selectors[key]> }

type OmitFunctionFirstArgument<F> = F extends (x: any, ...args: infer P) => infer R ? (...args: P) => R : never;

export type StoreAction<Reducer extends StoreReducer<any>> = OmitFunctionFirstArgument<Reducer>;

export type StoreActions<State, Reducers extends StoreReducers<State>> = {
  [key in keyof Reducers]: StoreAction<Reducers[key]>;
}

export type StoreListener<State> = (newState: State) => void;
