import { useEffect, useState, useRef } from "react";

export class Store<T, A> {
    constructor(public state: T, public reducer: (state: T, action: A) => T) {}

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
    }

    public dispatch = (action: A) => {
        if (!this.reducer) return;
        const nextState = this.reducer(this.state, action);
        this.state = nextState;
        this.emit();
    };
}

// Hook that subscribes to a store.
export function useStore<T, A>(store: Store<T, A>) {
    const [state, setState] = useState(store.state);

    useEffect(() => {
        store.addListener(setState);
    }, [store]);

    return [state, store.setState] as const;
}

export function useStateRef<T, A, Key extends keyof T>(
    store: Store<T, A>,
    key: Key
) {
    const [state, setState] = useState(store.state);
    const [keyState, setKeyState] = useState<T[Key]>(state[key]);
    const keyRef = useRef<T[Key]>(keyState);
    keyRef.current = keyState;

    useEffect(() => {
        store.addListener((newState) => {
            if (newState[key] !== keyRef.current) setKeyState(newState[key]);
        });
    }, [store]);

    return [keyState, keyRef, setKeyState] as const;
}
