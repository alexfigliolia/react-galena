# React Galena
React Binding for Galena! Using `galena` with react is simple thanks to a set of HOC and hook factories provided by this package

## Installation

```bash
npm i -S react-galena
# or
yarn add react-galena
```

## Connecting Components
There are two primary API's developers can use for reading and mutating Galena State from React Components - hooks and HOC's! To get started, let's initialize some state and generate some hooks:

### Connecting Components to Galena Using Hooks
```typescript
// AppState.ts;
import { Galena, State, Profiler } from "galena";
import { 
	createUseState,
	createUseGalena, 
	createUseStateMutation,
	createUseGalenaMutation, 
} from "react-galena"

export const AppState = new Galena<StateShape>([new Profiler()]);

export const NavigationState = AppState.createSlice("navigation", {
	route: "/";
	userID: "123",
	permittedRoutes: "**/*"
});

// Next, let's create some hooks!
export const useAppState = createUseGalena(AppState); // A hook for reading values from your global application state
export const useNavigation = createUseState(NavigationState); // A hook for reading values directly from your Navigation state
export const useAppStateMutation = createUseGalenaMutation(AppState); // A hook for mutating your global applications state
export const useNavigationMutation = createUseStateMutation(Navigation); // A hook for mutating your Navigation state directly
```
Each of the hooks above can provide read or write capabilities to either the `AppState` instance or directly to our `NavigationState`. First we'll look at examples using the global `AppState`

### useAppState and useAppStateMutation
These hooks allow you to read and mutate state using your Galena instance. 
#### useAppState
`useAppState()` is a selector engine for subscribing to data in your Application State. Using `useAppState()` you can read or compute from any value(s) in your application state and your component will re-render any time that value changes.

#### useAppStateMutation
`useAppStateMutation()` will accept any callback and pre-prepend the current application state to it's arguments. Using your callback you can mutate any slice of state entirely in-place! In the example below, modifying `route` using `useAppStateMutation()` will cause the `useAppState()` selector to rerender with the current value of `NavigationState.route`!

```tsx
// MyComponent.ts
import { useAppState, useAppStateMutation } from "./AppState";
import type { NavigationState } from "./AppState".

const MyComponent = () => {
	const currentRoute = useAppState(state => state.navigation.get("route"));
	const transitionRoute = useAppStateMutation("navigation", (
		state: typeof NavigationState["state"], 
		event: MouseEvent<HTMLAnchorElement>
	) => {
		state.route = event.dataset.route;
	});

	return (
		<nav>
			<div>{currentRoute}</div>
			<Link data-route="/" onClick={transitionRoute} />
			<Link data-route="/about" onClick={transitionRoute} />
			<Link data-route="/contact" onClick={transitionRoute} />
		</nav>
	);
}
```

### useNavigation and useNavigationMutation
The hooks you generate using your individual slices (`createUseState()`) of state have an optimization that developers can take advantage of for better performance. Although these hooks work almost identically to the ones generated using `createUseGalena()` and `createUseGalenaMutation()`, they're scoped specifically to one slice of state at a time. `Galena` has an internal optimization that allows these hooks to *only* re-compute/rerender if the slice they're registered to change. By using hooks registered on your state slices, it's easy to reduce the overhead of state selectors significantly. When compared to libraries such as Redux or Apollo, Galena can derive your stateful values using significantly less unnecessary recomputation and rerendering.

#### useNavigation
`useNavigation()` is a selector engine for subscribing to data in your Navigation State instance. Using `useNavigation()` you can read or compute from any value(s) in your Navigation state and your component will re-render any time that value changes.

#### useNavigationMutation
`useNavigationMutation()` will accept any callback and pre-prepend the current application state to it's arguments. Using your callback you can your Navigation state entirely in-place! In the example below, modifying `route` using `useNavigationMutation()` will cause the `useNavigation()` selector to rerender with the current value of `NavigationState.route`!

```tsx
// MyComponent.ts
import { useNavigation, useNavigationMutation } from "./AppState";
import type { NavigationState } from "./AppState".

const MyComponent = () => {
	const currentRoute = useNavigation(navState => navState.route);
	const transitionRoute = useNavigationMutation((
		state: typeof NavigationState["state"], 
		event: MouseEvent<HTMLAnchorElement>
	) => {
		state.route = event.dataset.route;
	});

	return (
		<nav>
			<div>{currentRoute}</div>
			<Link data-route="/" onClick={transitionRoute} />
			<Link data-route="/about" onClick={transitionRoute} />
			<Link data-route="/contact" onClick={transitionRoute} />
		</nav>
	);
}
```

### Connecting Components to Galena Using HOC's
This library provides factories for generating `HOC's` from your `Galena` and `State` instance. Let's take a look at the example above using, HOC's:

```typescript
// AppState.ts;
import { Galena, State, Profiler } from "galena";
import { connectState, connectGalena } from "react-galena";

export const AppState = new Galena<StateShape>([new Profiler()]);

export const NavigationState = AppState.createSlice("navigation", {
	route: "/";
	userID: "123",
	permittedRoutes: "**/*"
});

// Next, let's create some HOC's!
export const connectToAppState = connectGalena(AppState); // An HOC for reading values from your global application state
export const connectToNavigation = connectState(NavigationState); // A HOC for reading values directly from your Navigation state

export type StateShape = {
	navigation: State<{
			route: string;
			userID: string;
			permittedRoutes: string;
	}>
}
```

#### connectToAppState
An HOC factory that provides a subscription to your global `AppState`

```tsx
// MyComponent.ts
import type { FC } from "react"; 
import type { useCallback } from "react"; 
import { connectToAppState, AppState } from "./AppState";
import type { StateShape } from "./AppState";

const MyComponent: FC<{ currentRoute: string }> = ({ currentRoute }) => {

	const transitionRoute = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
		AppState.getSlice("navigation").update(state => {
			state.route = e.data.route;
		});
	}, []);

	return (
		<nav>
			<div>{currentRoute}</div>
			<Link data-route="/" onClick={transitionRoute} />
			<Link data-route="/about" onClick={transitionRoute} />
			<Link data-route="/contact" onClick={transitionRoute} />
		</nav>
	);
}

const mSTP = (state: StateShape) => {
	return { currentRoute: state.navigation.get("route") };
}

export default connectToAppState(mSTP)(MyComponent);
```

Next, let's look at the same example using our slice of state (`Navigation`) instead of `AppState`

#### connectNavigation
An HOC factory that provides a subscription to our `NavigationState`

```tsx
// MyComponent.ts
import type { FC } from "react"; 
import type { useCallback } from "react"; 
import { connectToNavigation, NavigationState } from "./AppState";

const MyComponent: FC<{ currentRoute: string }> = ({ currentRoute }) => {

	const transitionRoute = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
		NavigationState.update(state => {
			state.route = e.data.route;
		});
	}, []);

	return (
		<nav>
			<div>{currentRoute}</div>
			<Link data-route="/" onClick={transitionRoute} />
			<Link data-route="/about" onClick={transitionRoute} />
			<Link data-route="/contact" onClick={transitionRoute} />
		</nav>
	);
}

const mSTP = (state: typeof NavigationState["state"]) => {
	return { currentRoute: state.route };
}

export default connectToNavigation(mSTP)(MyComponent);
```

