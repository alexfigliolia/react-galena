# React Galena
React Bindings for Galena! Using `galena` with react is simple thanks to a set of factories for generating HOC's and hooks from your application state.

## Installation

```bash
npm i -S @figliolia/galena @figliolia/react-galena
# or
yarn add @figliolia/galena @figliolia/react-galena
```

## Getting Started
There are two primary API's developers can use for reading and mutating Galena State from React Components - hooks and HOC's! To get started, let's initialize some state and generate some hooks for accessing it in React:

### Connecting Components to State Using React Hooks
```typescript
// AppState.ts;
import { Galena, State } from "@figliolia/galena";
import {
  createUseState,
  createUseMutation,
} from "@figliolia/react-galena"

export const AppState = new Galena<{
  navigation: State<{
    route: string;
    userID: string;
    permittedRoutes: string;
  }>
}>();

export const NavigationState = AppState.composeState("navigation", {
  route: "/";
  userID: "123",
  permittedRoutes: "**/*"
});

// Next, let's create some hooks!
export const useAppState = createUseState(AppState); // Returns a hook for selecting values from your global application state
export const useNavigation = createUseState(NavigationState); // Returns a hook for selecting values from your Navigation state
export const useAppStateMutation = createUseMutation(AppState); // Returns a hook for mutating your Galena State
export const useNavigationMutation = createUseMutation(Navigation); // Returns a hook for mutating your Navigation state
```

#### createUseState()
`createUseState()` will accept any `Galena` instance or unit of `State` as a parameter and return a React Hook for selecting values from your state. Using the hook returned from `createUseState()`, you can read or compute from any value(s) in your application state and your component will re-render any time that value changes:

```tsx
// Navigation.ts
import { useAppState, useNavigationState } from "./AppState";

const Navigation = () => {
  const currentRoute = useAppState(({ navigation }) => navigation.route);
  // or using your Navigation Unit
  const currentRoute = useNavigationState(({ state }) => state.route);

  return (
    <nav>
      <div>{currentRoute}</div>
      <Link to="/" text="Home" />
      <Link to="/about" text="About" />
      <Link to="/contact" text="Contact" />
    </nav>
  );
}
```

#### createUseMutation()
Similar to `createUseState()`, `createUseMutation()` will accept any `Galena` instance or unit of `State` and return a hook providing mutation methods for updating your state. The `Mutation` object returned by the hook, exposes three methods for updating your state!

```tsx
import { useAppStateMutation, useNavigationMutation } from "./AppState";

const Link = ({ route, text }) => {

  const { update, backgroundUpdate, priorityUpdate } = useAppStateMutation();
  // or using your Navigation Unit
  const { update, backgroundUpdate, priorityUpdate } = useNavigationMutation();

  const navigate = () => {
    update(state => {
      state.route = e.dataset.route;
    });
  }

  return (
    <a data-route={route} onClick={navigate}>{text}</a>
  );
}
```

To read more about `Galena`'s various mutation methods, please reference the [API Documentation](https://github.com/alexfigliolia/galena#api-reference).

### Connecting Components to Galena Using HOC's
This library provides factories for generating `HOC's` from your `Galena` and `State` instance. Let's take a look at the example above this time, using HOC's:

```typescript
// AppState.ts;
import { Galena, State} from "@figliolia/galena";
import { connect } from "@figliolia/react-galena";

export const AppState = new Galena<{
  navigation: State<{
    route: string;
    userID: string;
    permittedRoutes: string;
  }>
}>();

export const NavigationState = AppState.composeState("navigation", {
  route: "/";
  userID: "123",
  permittedRoutes: "**/*"
});

// Next, let's create some HOC's!
export const connectAppState = connect(AppState); // An HOC for reading values from your global application state
export const connectNavigation = connect(NavigationState); // A HOC for reading values directly from your Navigation state
```

#### Using Your Generated HOC's
```tsx
// Navigation.ts
import type { FC } from "react"; 
import type { useCallback } from "react"; 
import { connectAppState, connectNavigation } from "./AppState";

const Navigation: FC<{ route: string }> = ({ route }) => {
  return (
    <nav>
      <div>{route}</div>
      <Link to="/" />
      <Link to="/about" />
      <Link to="/contact" />
    </nav>
  );
}

// Using your global applications tate
export default connectAppState({ navigation } => ({
  route: navigation.state.route
}))(Navigation);

// Or using your Navigation Unit
export default connectNavigation({ state } => ({
  route: state.route
}));
```

#### Mutating State without createUseMutation()
When composing your State using `galena`, it's possible to mutate your units of state in your React Components without any Hooks or HOC's. If you'd like to opt for hook-free state mutations, you may simply import the objects returned from `new Galena()`, `new Galena().composeState()`, and `new State()`. These objects are framework agnostic!

```tsx
import { NavigationState } from "./AppState";

const Link = ({ route, text }) => {

  const navigate = () => {
    NavigationState.update(state => {
      state.route = e.dataset.route;
    });
  }

  return (
    <a data-route={route} onClick={navigate}>{text}</a>
  );
}
```

#### Stateful Actions that can be used inside and outside of React!
For maximum code-reuse, you may choose to compose generic actions for your state instances. This architectural pattern can create a more Redux-like development experience - but without requiring you to manage any reducers. 

```typescript
// NavigationMutations.ts
import { NavigationState } from "./AppState";

export const transitionRoute = (nextRoute: string) => {
  NavigationState.update(state => {
    state.route = nextRoute;
  });
}

export const updateRoutePermissions = (permissions: string) => {
  NavigationState.update(state => {
    state.permittedRoutes = permissions;
  });
}
```

Using this pattern, you can simply create your state mutations then import them for use in your React Components and business logic:

```tsx
import { transitionRoute } from "./NavigationMutations";

const Link = ({ route, text }) => {
  return (
    <a data-route={route} onClick={transitionRoute}>{text}</a>
  );
}
```
