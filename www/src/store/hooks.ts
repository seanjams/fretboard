import { useEffect, useState, useRef } from "react";
import { Store } from "./store";

export function useStore<T>(store: Store<T>, listener?: (state: T) => void) {
    const [state, setState] = useState<T>(store.state);
    const stateRef = useRef<T>(state); // to track updates
    stateRef.current = state;

    useEffect(() => {
        return store.addListener((newState) => {
            setState(newState);
            if (listener) listener(newState);
        });
    }, [store]);

    return [state, store.setState] as const;
}
