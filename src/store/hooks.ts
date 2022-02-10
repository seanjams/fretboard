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

export const useKeyPressHandlers = (
    onStart?: (event: KeyboardEvent) => void,
    onEnd?: (event: KeyboardEvent) => void
) => {
    const isPressedRef = useRef(false);

    const start = useCallback(
        (event: KeyboardEvent) => {
            // set isPressed
            isPressedRef.current = true;

            // call handler
            if (onStart) onStart(event);
        },
        [onStart]
    );

    const clear = useCallback(
        (event: KeyboardEvent) => {
            if (!isPressedRef.current) return;
            // set isPressed
            isPressedRef.current = false;

            // call handler
            if (onEnd) onEnd(event);
        },
        [onEnd]
    );

    // handlers
    const onKeyDown = (event: KeyboardEvent) => start(event);
    const onKeyUp = (event: KeyboardEvent) => clear(event);

    useEffect(() => {
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
        };
    }, []);

    return {
        onKeyDown,
        onKeyUp,
    };
};

export const useTouchHandlers = (
    handlers: {
        onStart?: (event: ReactMouseEvent) => void;
        onEnd?: (event: WindowMouseEvent) => void;
        onMove?: (event: WindowMouseEvent) => void;
        onDoubleClick?: (event: ReactMouseEvent) => void;
    },
    { delay = 600 } = {}
) => {
    const isDraggingRef = useRef(false);
    const isPressedRef = useRef(false);
    const isPendingDoubleClickRef = useRef(false);
    const { onStart, onEnd, onMove, onDoubleClick } = handlers;

    const start = useCallback(
        (event: ReactMouseEvent) => {
            // set isPressed
            isPressedRef.current = true;

            if (isPendingDoubleClickRef.current) {
                // call double click handler
                isPendingDoubleClickRef.current = false;
                if (onDoubleClick) onDoubleClick(event);
            } else {
                // set timeout for double click
                isPendingDoubleClickRef.current = true;
                setTimeout(() => {
                    isPendingDoubleClickRef.current = false;
                }, delay);

                // call single click handler
                if (onStart) onStart(event);
            }
        },
        [onDoubleClick, onStart, delay]
    );

    const move = useCallback(
        (event: WindowMouseEvent) => {
            // set isDragging
            if (isPressedRef.current && !isDraggingRef.current)
                isDraggingRef.current = true;

            // call handler
            if (onMove) onMove(event);
        },
        [onMove]
    );

    const clear = useCallback(
        (event: WindowMouseEvent, shouldTriggerClick = true) => {
            event.preventDefault();
            event.stopPropagation();

            if (!isPressedRef.current) return;
            // set isPressed
            isPressedRef.current = false;

            // set isDragging
            isDraggingRef.current = false;

            // call handler
            if (
                shouldTriggerClick &&
                isPendingDoubleClickRef.current &&
                onEnd
            ) {
                onEnd(event);
            }
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

export const useOrientationChange = (onChange?: (event: Event) => void) => {
    const orientationRef = useRef(screen.orientation.type);

    // handlers
    const onOrientationChange = useCallback(
        (event: Event) => {
            orientationRef.current = screen.orientation.type;
            if (onChange) onChange(event);
        },
        [onChange]
    );

    useEffect(() => {
        window.addEventListener("orientationchange", onOrientationChange);
        return () => {
            window.removeEventListener(
                "orientationchange",
                onOrientationChange
            );
        };
    }, []);

    return () => orientationRef.current;
};
