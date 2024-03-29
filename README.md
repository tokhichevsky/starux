# STARUX

[![Build Status](https://img.shields.io/github/actions/workflow/status/tokhichevsky/starux/npm-publish.yml)](https://github.com/tokhichevsky/starux/actions?query=workflow%3A%22Node.js+Package%22++)
[![Build Size](https://img.shields.io/bundlephobia/minzip/starux?label=bundle%20size)](https://bundlephobia.com/result?p=starux)
[![Version](https://img.shields.io/npm/v/starux)](https://www.npmjs.com/package/starux)
[![Downloads](https://img.shields.io/npm/dt/starux.svg)](https://www.npmjs.com/package/starux)

A small library for creating stores.

```bash
npm install starux
```

```bash
yarn add starux
```


## Create a vanilla store


```jsx
import createStore from 'starux'

const userStore = createStore({
    initialState: {
        name: 'Jack',
        surname: 'Jackov'
    },
    reducers: {
        setName(state, name) {
            state.name = name
        },
        async setSurname(state, surname) {
            const isValid = await validateSurname(surname);
            if (isValid) {
                state.surname = surname;
            }
        },
        clear() {
            return {
                name: 'Jack',
                surname: 'Jackov'
            }
        }
    },
    selectors: {
        getName(state) {
            return state.name
        }
    }
})
```

Reducers turn into actions. You can pass multiple arguments to them.
Selectors are used as an aid to avoid placing them in separate functions/objects etc.

### Usage

```jsx
userStore.actions.setName('Anna') // changes state.name to Anna
userStore.actions.setSurname('Baykova') // return Promise
await userStore.actions.setSurname('Baykova') // changes state.surname to Baykova

userStore.get() // returns state
userStore.get((state) => state.name) // returns state.name
userStore.get.getName() // returns state.name

const unsubscribe = userStore.subscribe((state) => doSomething(state)) // calls callback every state changing
```

## Create a react store


```jsx
import createHookStore from 'starux/react'

const userStore = createHookStore({
    initialState: {
        name: 'Jack',
        surname: 'Jackov'
    },
    reducers: {
        setName(state, name) {
            state.name = name
        },
        async setSurname(state, surname) {
            const isValid = await validateSurname(surname);
            if (isValid) {
                state.surname = surname;
            }
        },
        clear() {
            return {
                name: 'Jack',
                surname: 'Jackov'
            }
        }
    },
    selectors: {
        getName(state) {
            return state.name
        }
    }
})
```

### Usage

```jsx
const actions = userStore.useActions();
// ...
actions.setName(); // changes state.name to Anna
actions.setSurname('Baykova') // return Promise
```
```jsx
const name = userStore.useSelector('getName') // returns state.name
const name = userStore.useSelector((state) => state.name) // returns state.name
const state = userStore.useSelector() // returns state
```

```jsx
userStore.useSubscribe((state) => doSomething(state)) // calls callback every state changing
```
