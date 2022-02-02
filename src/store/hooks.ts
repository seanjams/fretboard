import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { ReactMouseEvent, WindowMouseEvent } from "../types";

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

export const useTouchHandlers = (
    onStart?: (event: ReactMouseEvent) => void,
    onEnd?: (event: WindowMouseEvent) => void,
    onMove?: (event: WindowMouseEvent) => void,
    onLongPress?: (event: ReactMouseEvent) => void,
    { delay = 300, threshold = 50 } = {}
) => {
    const isDraggingRef = useRef(false);
    const isPressedRef = useRef(false);
    const isLongPressedRef = useRef(false);
    const isLongPressedTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

    const start = useCallback(
        (event: ReactMouseEvent) => {
            // set isPressed
            isPressedRef.current = true;

            // set isLongPressed
            if (isLongPressedTimeoutRef.current)
                clearTimeout(isLongPressedTimeoutRef.current);
            isLongPressedTimeoutRef.current = setTimeout(() => {
                if (onLongPress) onLongPress(event);
                isLongPressedRef.current = true;
            }, delay);

            // call handler
            if (onStart) onStart(event);
        },
        [onLongPress, onStart, delay]
    );

    const move = useCallback(
        (event: WindowMouseEvent) => {
            // set isDragging
            if (!isDraggingRef.current) isDraggingRef.current = true;

            // call handler
            if (onMove) onMove(event);
        },
        [onMove]
    );

    const clear = useCallback(
        (event: WindowMouseEvent, shouldTriggerClick = true) => {
            if (!isPressedRef.current) return;
            // set isPressed
            isPressedRef.current = false;

            // set isDragging
            isDraggingRef.current = false;

            // set isLongPressed
            isLongPressedRef.current = false;
            if (isLongPressedTimeoutRef.current) {
                clearTimeout(isLongPressedTimeoutRef.current);
                isLongPressedTimeoutRef.current = undefined;
            }

            // call handler
            if (shouldTriggerClick && !isLongPressedRef.current && onEnd)
                onEnd(event);
        },
        [onEnd]
    );

    // handlers
    const onMouseDown = (event: ReactMouseEvent) => start(event);
    const onTouchStart = (event: ReactMouseEvent) => start(event);
    const onMouseMove = (event: WindowMouseEvent) => move(event);
    const onTouchMove = (event: WindowMouseEvent) => move(event);
    const onMouseUp = (event: WindowMouseEvent) => clear(event);
    const onTouchEnd = (event: WindowMouseEvent) => clear(event);

    useEffect(() => {
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("touchmove", onTouchMove);
        window.addEventListener("mouseup", onMouseUp);
        window.addEventListener("touchend", onTouchEnd);
        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("touchmove", onTouchMove);
            window.removeEventListener("mouseup", onMouseUp);
            window.removeEventListener("touchend", onTouchEnd);
        };
    }, []);

    return {
        onMouseDown,
        onTouchStart,
    };
};
