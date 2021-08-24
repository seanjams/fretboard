import { useEffect, useState, useRef, useCallback } from "react";

export class Store<T, A> {
    constructor(public state: T, public reducer: (state: T, action: A) => T) {}

    public setState = (nextState: T) => {
        // console.log("setState", nextState);
        this.state = nextState;
        this.emit();
    };

    public getState = () => {
        return this.state;
    };

    public setPartialState = (partialState: Partial<T>) => {
        // console.log("setPartialState", partialState);
        for (let key in partialState) {
            this.state[key] = partialState[key];
        }
        this.emit();
    };

    public setKey = (key: keyof T, value: any) => {
        // console.log("setKey", key, value);
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
        // console.log("dispatch", action);
        const nextState = this.reducer(this.state, action);
        this.state = nextState;
        this.emit();
    };
}

// Hook that subscribes to a store.
export function useActiveStore<T, A>(store: Store<T, A>) {
    const [state, setState] = useState(store.state);
    const stateRef = useRef(state);
    stateRef.current = state;

    useEffect(() => {
        const destroy = store.addListener(setState);
        return () => {
            destroy();
        };
    }, [store]);

    return [() => stateRef.current, store.setState] as const;
}

// Hook that subscribes to a store.
export function usePassiveStore<T, A>(store: Store<T, A>) {
    const stateRef = useRef(store.state);

    useEffect(() => {
        const destroy = store.addListener(
            (newState) => (stateRef.current = newState)
        );
        return () => {
            destroy();
        };
    }, [store]);

    return [() => stateRef.current] as const;
}

export function useActiveStoreRef<T, A, Key extends keyof T>(
    store: Store<T, A>,
    key: Key
) {
    const [keyState, setKeyState] = useState<T[Key]>(store.state[key]);
    const keyRef = useRef<T[Key]>(keyState);
    keyRef.current = keyState;

    useEffect(() => {
        const destroy = store.addListener((newState) => {
            if (newState[key] !== keyRef.current) setKeyState(newState[key]);
        });
        return () => {
            destroy();
        };
    }, [store]);

    return [() => keyRef.current, setKeyState] as const;
}

export function usePassiveStoreRef<T, A, Key extends keyof T>(
    store: Store<T, A>,
    key: Key
) {
    const keyRef = useRef<T[Key]>(store.state[key]);

    useEffect(() => {
        const destroy = store.addListener((newState) => {
            if (newState[key] !== keyRef.current)
                keyRef.current = newState[key];
        });
        return () => {
            destroy();
        };
    }, [store]);

    return [() => keyRef.current] as const;
}

interface DragStore {
    isDragging: boolean;
}

export function useDragging<T extends DragStore, A>(store: Store<T, A>) {
    const isDraggingRef = useRef(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

    useEffect(() => {
        const destroy = store.addListener(({ isDragging }) => {
            if (isDraggingRef.current !== isDragging)
                isDraggingRef.current = isDragging;
        });
        window.addEventListener("mouseup", onDragStart);
        window.addEventListener("touchend", onDragStart);
        return () => {
            destroy();
            window.removeEventListener("mouseup", onDragStart);
            window.removeEventListener("touchend", onDragStart);
        };
    }, []);

    const onDragStart = useCallback(
        (event: MouseEvent | TouchEvent) => {
            event.preventDefault();
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (isDraggingRef.current) store.setKey("isDragging", false);
        },
        [store]
    );

    const onDragEnd = useCallback(
        (
            event:
                | React.MouseEvent<HTMLDivElement, MouseEvent>
                | React.TouchEvent<HTMLDivElement>
        ) => {
            event.preventDefault();
            timeoutRef.current = setTimeout(
                () => store.setKey("isDragging", true),
                300
            );
        },
        [store]
    );

    return [onDragStart, onDragEnd];
}
