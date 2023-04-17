import { createStore } from './store';

const delay = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const initialState = {
  name: '',
  isActive: true,
  profile: { avatar: 'avatar.png', credentials: { login: 'starux', password: 'pass' } },
};

const createTestStore = () => createStore({
  initialState,
  reducers: {
    setName: (state, name: string) => {
      state.name = name;
    },
    setAvatar: (state, avatar: string) => {
      state.profile.avatar = avatar;
    },
    setCredentials: (state, login: string, password: string) => {
      state.profile.credentials.login = login;
      state.profile.credentials.password = password;
    },
    deactivate: (state) => {
      state.isActive = false;
    },
    clear: () => {
      return {
        name: '',
        isActive: true,
        profile: { avatar: 'avatar.png', credentials: { login: 'starux', password: 'pass' } },
      };
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

  describe('async tests', () => {
    let store: ReturnType<typeof createTestStore>;
    beforeEach(() => {
      store = createTestStore();
    });

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
