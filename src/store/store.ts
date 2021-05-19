import { useEffect, useState } from "react";

export class Store<T> {
	constructor(public state: T) {}

	public setState = (nextState: T) => {
		this.state = nextState;
		this.emit();
	};

	public setKey = (key: keyof T, value: any) => {
		this.state[key] = value;
		this.emit();
	};

	private listeners = new Set<(state: T) => void>();

	public addListener(fn: (state: T) => void) {
		this.listeners.add(fn);
		return () => this.listeners.delete(fn);
	}

	private emit() {
		this.listeners.forEach((fn) => fn(this.state));
		// console.log(this.state);
	}
}

// Hook that subscribes to a store.
export function useStore<T>(store: Store<T>) {
	const [state, setState] = useState(store.state);

	useEffect(() => {
		return store.addListener(setState);
	}, [store]);

	return [state, store.setState] as const;
}
