import { createStore } from './store';

const delay = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const initialState: {
  profile: { credentials: { password: string; login: string, arr: any[] }; avatar: string, avatarNum: number };
  name?: string;
  isActive: boolean
} = {
  isActive: true,
  profile: { avatar: 'avatar.png', avatarNum: 0, credentials: { login: 'starux', password: 'pass', arr: [ 'asdasd', { a: 'a' } ] } },
};

const createTestStore = () => createStore({
  initialState,
  reducers: {
    setName: (state, name: string) => {
      state.name = name;
    },
    setNameAndActiveByName: (state, name: string) => {
      state.name = name;
      state.isActive = name !== 'alex';
    },
    setAvatar: (state, avatar: string) => {
      state.profile.avatar = avatar;
    },
    setAvatarAndAvatarNum: async (state, avatar: string) => {
      const newNum  = state.profile.avatarNum + 1;
      state.profile.avatar = avatar;
      state.profile.avatarNum = newNum;
      await delay(200);
    },
    setCredentials: (state, login: string, password: string) => {
      state.profile.credentials.login = login;
      state.profile.credentials.password = password;
    },
    deactivate: (state) => {
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
});


describe('Starux tests', () => {
  describe('common tests', () => {
    let store: ReturnType<typeof createTestStore>;
    beforeEach(() => {
      store = createTestStore();
    });
    test('Initial state not changing', () => {
      const state = store.get();
      expect(state.profile.avatar).toBe('avatar.png');
      expect(initialState.profile.avatar).toBe('avatar.png');
      store.actions.setAvatar('ava.jpg');
      expect(state.profile.avatar).toBe('ava.jpg');
      expect(initialState.profile.avatar).toBe('avatar.png');
    });
    test('Changing property', () => {
      const state = store.get();
      expect(state.isActive).toBe(true);
      store.actions.deactivate();
      expect(state.isActive).toBe(false);
    });

    test('Changing property of state property', () => {
      const state = store.get();
      expect(state.profile.avatar).toBe('avatar.png');
      store.actions.setAvatar('ava.jpg');
      expect(state.profile.avatar).toBe('ava.jpg');
    });

    test('Not changing whole state', () => {
      const state = store.get();
      expect(state.profile.avatar).toBe('avatar.png');
      store.actions.setAvatar('ava.jpg');
      expect(state.profile.avatar).toBe('ava.jpg');
      const newState = store.get();
      expect(newState.profile.avatar).toBe('ava.jpg');
    });

    test('changes state in context', () => {
      const state = store.get();
      expect(state.name).toBe(undefined);
      expect(state.isActive).toBeTruthy();
      store.actions.setNameAndActiveByName('alex');
      expect(state.name).toBe('alex');
      expect(state.isActive).toBeFalsy();
    })

    test('Returning state', () => {
      const state = store.get();
      expect(state.profile.avatar).toBe('avatar.png');
      store.actions.setAvatar('ava.jpg');
      expect(state.profile.avatar).toBe('ava.jpg');
      store.actions.clear();
      expect(state.profile.avatar).toBe('ava.jpg');
      const newState = store.get();
      expect(newState.profile.avatar).toBe('avatar.png');
    });
    test('subscribe', () => {
      const listener = jest.fn();
      store.subscribe((state) => {
        expect(state.name).toEqual('anton');
        listener();
      });
      store.actions.setName('anton');
      expect(listener).toBeCalledTimes(1);
    });
  });

  describe('async tests', () => {
    let store: ReturnType<typeof createTestStore>;
    beforeEach(() => {
      store = createTestStore();
    });

    test('changes state in context async', async () => {
      const state = store.get();
      expect(state.profile.avatar).toBe('avatar.png');
      expect(state.profile.avatarNum).toBe(0);
      await store.actions.setAvatarAndAvatarNum('ava');
      await store.actions.setAvatarAndAvatarNum('av0');
      expect(state.profile.avatar).toBe('av0');
      expect(state.profile.avatarNum).toBe(2);
    })

    test('Changing property of state property', async () => {
      const state = store.get();
      expect(state.profile.avatar).toBe('avatar.png');
      await store.actions.asyncSetAvatar('ava.jpg');
      expect(state.profile.avatar).toBe('ava.jpg');
    });

    test('Not changing whole state', async () => {
      const state = store.get();
      expect(state.profile.avatar).toBe('avatar.png');
      await store.actions.asyncSetAvatar('ava.jpg');
      expect(state.profile.avatar).toBe('ava.jpg');
      const newState = store.get();
      expect(newState.profile.avatar).toBe('ava.jpg');
    });

    test('Returning state', () => {
      const state = store.get();
      expect(state.profile.avatar).toBe('avatar.png');
      store.actions.setAvatar('ava.jpg');
      expect(state.profile.avatar).toBe('ava.jpg');
      store.actions.clear();
      expect(state.profile.avatar).toBe('ava.jpg');
      const newState = store.get();
      expect(newState.profile.avatar).toBe('avatar.png');
    });
  });
});
