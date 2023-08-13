import { createHookStore } from './hook';
import { render, waitFor } from '@testing-library/react';
import React, { useEffect } from 'react';
import { act } from 'react-dom/test-utils';

const delay = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};


const initialState = {
  name: 'anton',
  isActive: true,
  profile: { avatar: 'avatar.png', credentials: { login: 'starux', password: 'pass', arr: [ 'adasd', { a: 'a' } ] } },
};

const createHookTestStore = () => createHookStore({
  initialState,
  reducers: {
    setName: (state, name: string) => {
      state.name = name;
    },
    asyncSetName: async (state, name: string) => {
      await delay(100);
      state.name = name;
    },
    setAvatar: (state, avatar: string) => {
      state.profile.avatar = avatar;
    },
    setCredentials: (state, login: string, password: string) => {
      state.profile.credentials.login = login;
      state.profile.credentials.password = password;
    },
    asyncSetCredentials: async (state, login: string, password: string) => {
      await delay(100);
      state.profile.credentials.login = login;
      state.profile.credentials.password = password;
    },
    deactivate: (state) => {
      state.isActive = false;
    },
    asyncDeactivate: async (state) => {
      await delay(100);
      state.isActive = false;
    },
    clear: () => {
      return initialState;
    },
    asyncSetAvatar: async (state, avatar: string) => {
      await delay(200);
      state.profile.avatar = avatar;
    },
  },
  selectors: {
    getName: (state) => state.name,
    getProfile: (state) => state.profile,
  },
});

describe('Starux hook tests', () => {
  describe('sync', () => {
    let store: ReturnType<typeof createHookTestStore>;
    let onRerender = jest.fn();

    beforeEach(() => {
      store = createHookTestStore();
      onRerender = jest.fn();
    });

    const SelectorComponent = (props: { selector: ((state: typeof initialState) => any) | string }) => {
      const selected = store.useSelector(props.selector as any);

      useEffect(() => {
        onRerender();
      }, [ selected ]);
      return <div data-testid="selector">{typeof selected === 'object' ? JSON.stringify(selected) : selected}</div>;
    };

    const ActionComponent = (props: { do: (actions: ReturnType<typeof store.useActions>) => void }) => {
      const actions = store.useActions();

      useEffect(() => {
        props.do(actions);
      }, [ actions, props.do ]);
      return <div data-testid="selector"></div>;
    };

    test('[selector] rerender test', async () => {
      const { findByTestId } = render(<SelectorComponent selector={(state) => state.name}/>);
      const content = await findByTestId('selector');
      expect(content.innerHTML).toBe('anton');
      expect(onRerender).toBeCalledTimes(1);
      act(() => {
        store.store.actions.deactivate();
      });
      expect(onRerender).toBeCalledTimes(1);
      act(() => {
        store.store.actions.setName('kim');
      });
      expect(content.innerHTML).toBe('kim');
      expect(onRerender).toBeCalledTimes(2);
    });

    test('[selector] key', async () => {
      const { findByTestId } = render(<SelectorComponent selector="getName"/>);
      const content = await findByTestId('selector');
      expect(content.innerHTML).toBe('anton');
      expect(onRerender).toBeCalledTimes(1);
      act(() => {
        store.store.actions.deactivate();
      });
      expect(onRerender).toBeCalledTimes(1);
      act(() => {
        store.store.actions.setName('kim');
      });
      expect(content.innerHTML).toBe('kim');
      expect(onRerender).toBeCalledTimes(2);
    });

    test('[selector] key [return object]', async () => {
      const { findByTestId } = render(<SelectorComponent selector="getProfile"/>);
      const content = await findByTestId('selector');
      const jsonState = JSON.stringify(store.store.get().profile);
      const state = JSON.parse(jsonState);

      expect(content.innerHTML).toBe(jsonState);
      expect(onRerender).toBeCalledTimes(1);
      act(() => {
        store.store.actions.deactivate();
      });
      expect(onRerender).toBeCalledTimes(1);
      act(() => {
        store.store.actions.setAvatar('kim');
      });
      expect(content.innerHTML).toBe(JSON.stringify({ ...state, avatar: 'kim' }));
      expect(onRerender).toBeCalledTimes(2);
    });

    test('[selector] rerender by changing object', async () => {
      const { findByTestId } = render(<SelectorComponent selector={(state) => state.profile.avatar}/>);
      const content = await findByTestId('selector');
      expect(content.innerHTML).toBe('avatar.png');
      expect(onRerender).toBeCalledTimes(1);
      expect(store.store.get(state => state.profile.avatar)).toBe('avatar.png');
      act(() => {
        store.store.actions.setCredentials('login', 'password');
      });
      const credentials = store.store.get().profile.credentials;
      expect(credentials.login).toEqual('login');
      expect(credentials.password).toEqual('password');
      expect(onRerender).toBeCalledTimes(1);
      act(() => {
        store.store.actions.setAvatar('ava');
      });
      expect(content.innerHTML).toBe('ava');
      expect(onRerender).toBeCalledTimes(2);
    });

    test('[actions] work', () => {
      expect(store.store.get().isActive).toBe(true);
      render(<ActionComponent do={(actions) => actions.deactivate()}/>);
      expect(store.store.get().isActive).toBe(false);
    });
  });

  describe('async', () => {
    let store: ReturnType<typeof createHookTestStore>;
    let onRerender = jest.fn();

    beforeEach(() => {
      store = createHookTestStore();
      onRerender = jest.fn();
    });

    const SelectorComponent = (props: { selector: (state: typeof initialState) => any }) => {
      const selected = store.useSelector(props.selector);

      useEffect(() => {
        onRerender();
      }, [ selected ]);
      return <div data-testid="selector">{selected.toString()}</div>;
    };

    const ActionComponent = (props: { do: (actions: ReturnType<typeof store.useActions>) => void }) => {
      const actions = store.useActions();

      useEffect(() => {
        props.do(actions);
      }, [ actions, props.do ]);
      return <div data-testid="selector"></div>;
    };

    test('[selector] rerender test', async () => {
      const { findByTestId } = render(<SelectorComponent selector={(state) => state.name}/>);
      const content = await findByTestId('selector');
      expect(content.innerHTML).toBe('anton');
      expect(onRerender).toBeCalledTimes(1);
      await act(async () => {
        await store.store.actions.asyncDeactivate();
      });
      expect(onRerender).toBeCalledTimes(1);
      await act(async () => {
        await store.store.actions.asyncSetName('kim');
      });
      expect(content.innerHTML).toBe('kim');
      expect(onRerender).toBeCalledTimes(2);
    });

    test('[selector] key', async () => {
      const { findByTestId } = render(<SelectorComponent selector={(state) => state.name}/>);
      const content = await findByTestId('selector');
      expect(content.innerHTML).toBe('anton');
      expect(onRerender).toBeCalledTimes(1);
      await act(async () => {
        await store.store.actions.asyncDeactivate();
      });
      expect(onRerender).toBeCalledTimes(1);
      await act(async () => {
        await store.store.actions.asyncSetName('kim');
      });
      expect(content.innerHTML).toBe('kim');
      expect(onRerender).toBeCalledTimes(2);
    });

    test('[selector] rerender by changing object', async () => {
      const { findByTestId } = render(<SelectorComponent selector={(state) => state.profile.avatar}/>);
      const content = await findByTestId('selector');
      expect(content.innerHTML).toBe('avatar.png');
      expect(onRerender).toBeCalledTimes(1);
      expect(store.store.get(state => state.profile.avatar)).toBe('avatar.png');
      await act(async () => {
        await store.store.actions.asyncSetCredentials('login', 'password');
      });
      expect(onRerender).toBeCalledTimes(1);
      await act(async () => {
        await store.store.actions.asyncSetAvatar('ava');
      });
      expect(content.innerHTML).toBe('ava');
      expect(onRerender).toBeCalledTimes(2);
    });

    test('[actions] work', async () => {
      expect(store.store.get().isActive).toBe(true);
      render(<ActionComponent
        do={(actions) => void actions.asyncDeactivate()}/>);
      expect(store.store.get().isActive).toBe(true);
      await waitFor(() => {
        expect(store.store.get().isActive).toBe(false);
      });
    });
  });
});
