import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { stopClick } from "../utils";
import { Store } from "./store";
import { TouchStore } from "./TouchState";

// export function useStore<T>(store: Store<T>, listener?: (state: T) => void) {
//     const [state, setState] = useState<T>(store.state);
//     const stateRef = useRef<T>(state); // to track updates
//     stateRef.current = state;

//     useEffect(() => {
//         return store.addListener((newState) => {
//             setState(newState);
//             if (listener) listener(newState);
//         });
//     }, [store]);

//     return [state, store.setState] as const;
// }

// pass function instead of value and useMemo on the object it returns
export function useStateRef<T>(
    defaultState: () => T
): [() => T, React.Dispatch<React.SetStateAction<Partial<T>>>] {
    const [state, setState] = useState(useMemo(defaultState, []));
    const stateRef = useRef(state);
    stateRef.current = state;
    return [
        () => stateRef.current,
        (newState) => {
            setState((prevState) => ({ ...prevState, ...newState }));
        },
    ];
}

export function useWindowListener<K extends keyof WindowEventMap>(
    type: K,
    listener: (this: Window, ev: WindowEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions | undefined
) {
    useEffect(() => {
        window.addEventListener(type, listener, options);
        return () => {
            window.removeEventListener(type, listener, options);
        };
    }, []);
}

export function useTouchStore(): TouchStore {
    const store = useMemo(() => new TouchStore(), []);

    // Up Events
    const onMouseUp = useCallback((event: MouseEvent | TouchEvent) => {
        store.dispatch.clearState();
        // stopClick();
    }, []);

    const onTouchEnd = useCallback((event: MouseEvent | TouchEvent) => {
        event.preventDefault();
        store.dispatch.clearState();
        // stopClick();
    }, []);

    // Move Events
    const onMouseMove = useCallback((event: MouseEvent | TouchEvent) => {
        const { isPressed, isDragging } = store.state;
        if (isPressed && !isDragging) store.dispatch.setIsDragging(true);
    }, []);

    const onTouchMove = useCallback((event: MouseEvent | TouchEvent) => {
        event.preventDefault();
        const { isPressed, isDragging } = store.state;
        if (isPressed && !isDragging) store.dispatch.setIsDragging(true);
    }, []);

    // Down Events
    const onMouseDown = useCallback((event: MouseEvent | TouchEvent) => {
        store.dispatch.clearState();
        const { isPressed } = store.state;
        if (!isPressed) store.dispatch.setIsPressed(true);

        // if (event instanceof TouchEvent) {
        // highlight note if using touch device and press with two fingers
        // twoFingerTouchRef.current = event.touches.length > 1;
        // }
    }, []);

    const onTouchStart = useCallback((event: MouseEvent | TouchEvent) => {
        event.preventDefault();
        store.dispatch.clearState();
        const { isPressed } = store.state;
        if (!isPressed) store.dispatch.setIsPressed(true);

        // if (event instanceof TouchEvent) {
        // highlight note if using touch device and press with two fingers
        // twoFingerTouchRef.current = event.touches.length > 1;
        // }
    }, []);

    // Click
    // const onClick = () => console.log("CLICK");

    useEffect(() => {
        window.addEventListener("mousedown", onMouseDown);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        window.addEventListener("touchstart", onTouchStart);
        window.addEventListener("touchmove", onTouchMove);
        window.addEventListener("touchend", onTouchEnd);
        // window.addEventListener("click", onClick);
        return () => {
            window.removeEventListener("mousedown", onMouseDown);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
            window.removeEventListener("touchstart", onTouchStart);
            window.removeEventListener("touchmove", onTouchMove);
            window.removeEventListener("touchend", onTouchEnd);
            // window.removeEventListener("click", onClick);
        };
    }, []);

    return store;
}
