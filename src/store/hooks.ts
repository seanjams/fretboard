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

export interface TouchStateType {
    isDragging: boolean;
    isPressed: boolean;
    isPendingDoubleClick: boolean;
    isLongPress: boolean;
    longPressTimeout: ReturnType<typeof setTimeout> | null;
    isExtraLongPress: boolean;
    extraLongPressTimeout: ReturnType<typeof setTimeout> | null;
    origin: [number, number] | null; // where touch was initiated
    coordinates: [number, number] | null; // current touch location
    isWithinThreshold: boolean;
}

export function getCoordinates(
    event: ReactMouseEvent | WindowMouseEvent
): [number, number] | null {
    let clientX: number;
    let clientY: number;
    if (event instanceof MouseEvent) {
        clientX = event.clientX;
        clientY = event.clientY;
    } else if (event instanceof TouchEvent) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        return null;
    }

    return [clientX, clientY];
}

export const useTouchHandlers = (
    handlers: {
        onStart?: (event: ReactMouseEvent, touchStore: TouchStateType) => void;
        onClick?: (event: WindowMouseEvent, touchStore: TouchStateType) => void;
        onEnd?: (event: WindowMouseEvent, touchStore: TouchStateType) => void;
        onMove?: (event: WindowMouseEvent, touchStore: TouchStateType) => void;
        onDoubleClick?: (
            event: ReactMouseEvent,
            touchStore: TouchStateType
        ) => void;
        onLongPress?: (
            event: ReactMouseEvent,
            touchStore: TouchStateType
        ) => void;
        onExtraLongPress?: (
            event: ReactMouseEvent,
            touchStore: TouchStateType
        ) => void;
    },
    {
        extraLongPressDelay = 1200,
        longPressDelay = 600,
        doubleClickDelay = 600,
        threshold = 10,
    } = {}
) => {
    const {
        onStart,
        onClick,
        onEnd,
        onMove,
        onDoubleClick,
        onLongPress,
        onExtraLongPress,
    } = handlers;

    const touchStoreRef = useRef<TouchStateType>({
        isDragging: false,
        isPressed: false,
        isPendingDoubleClick: false,
        isLongPress: false,
        longPressTimeout: null,
        isExtraLongPress: false,
        extraLongPressTimeout: null,
        origin: null,
        coordinates: null,
        isWithinThreshold: false,
    });

    const start = useCallback(
        (event: ReactMouseEvent) => {
            // set isPressed
            touchStoreRef.current.isPressed = true;

            // set press origin, coordinates
            let origin = (touchStoreRef.current.origin = getCoordinates(event));
            touchStoreRef.current.coordinates = origin;
            touchStoreRef.current.isWithinThreshold = true;

            if (touchStoreRef.current.isPendingDoubleClick) {
                // call double click handler
                touchStoreRef.current.isPendingDoubleClick = false;
                if (onDoubleClick) {
                    onDoubleClick(event, touchStoreRef.current);
                    return;
                }
            }
            // set timeout for double click
            touchStoreRef.current.isPendingDoubleClick = true;
            setTimeout(() => {
                touchStoreRef.current.isPendingDoubleClick = false;
            }, doubleClickDelay);

            // set timeout for long press
            touchStoreRef.current.isLongPress = false;
            touchStoreRef.current.longPressTimeout = setTimeout(() => {
                touchStoreRef.current.isLongPress = true;
                if (onLongPress) {
                    onLongPress(event, touchStoreRef.current);
                }
            }, longPressDelay);

            // set timeout for extra long press
            touchStoreRef.current.isExtraLongPress = false;
            touchStoreRef.current.extraLongPressTimeout = setTimeout(() => {
                touchStoreRef.current.isExtraLongPress = true;
                if (onExtraLongPress) {
                    onExtraLongPress(event, touchStoreRef.current);
                }
            }, extraLongPressDelay);

            // call single click handler
            if (onStart) onStart(event, touchStoreRef.current);
        },
        [
            onDoubleClick,
            onStart,
            onLongPress,
            onExtraLongPress,
            doubleClickDelay,
            longPressDelay,
            extraLongPressDelay,
        ]
    );

    const move = useCallback(
        (event: WindowMouseEvent) => {
            // set isDragging
            let {
                isPressed,
                isDragging,
                origin,
                longPressTimeout,
                extraLongPressTimeout,
                isWithinThreshold,
            } = touchStoreRef.current;

            if (isPressed && !isDragging) {
                touchStoreRef.current.isDragging = true;
            }
            // else if (!isPressed) {
            //     // for window events
            //     touchStoreRef.current.isDragging = false;
            // }

            // set coordinates if entering this component from drag
            let coordinates = (touchStoreRef.current.coordinates =
                getCoordinates(event));
            if (!origin) origin = touchStoreRef.current.origin = coordinates;

            // check if moved outside of boundary
            if (coordinates && origin && isPressed) {
                // set isWithinThreshold by checking current location hypotenuse length
                const [x0, y0] = origin;
                const [x1, y1] = coordinates;

                const newIsWithinThreshold =
                    (x1 - x0) ** 2 + (y1 - y0) ** 2 < threshold ** 2;

                // set isLongPress and isExtraLongPress
                if (isWithinThreshold && !newIsWithinThreshold) {
                    // isLongPress
                    if (longPressTimeout) {
                        clearTimeout(longPressTimeout);
                        touchStoreRef.current.longPressTimeout = null;
                    }
                    touchStoreRef.current.isLongPress = false;
                    // isExtraLongPress
                    if (extraLongPressTimeout) {
                        clearTimeout(extraLongPressTimeout);
                        touchStoreRef.current.extraLongPressTimeout = null;
                    }
                    touchStoreRef.current.isExtraLongPress = false;
                }

                touchStoreRef.current.isWithinThreshold = newIsWithinThreshold;
            }

            if (onMove)
                // call handler
                onMove(event, touchStoreRef.current);
        },
        [onMove]
    );

    const clear = useCallback(
        (event: WindowMouseEvent) => {
            event.preventDefault();
            event.stopPropagation();

            const {
                isPressed,
                isLongPress,
                isExtraLongPress,
                longPressTimeout,
                extraLongPressTimeout,
                isWithinThreshold,
                isPendingDoubleClick,
            } = touchStoreRef.current;

            if (!isPressed) return;
            let shouldTriggerClick =
                isWithinThreshold &&
                isPendingDoubleClick &&
                !isLongPress &&
                !isExtraLongPress;

            // call handler before resetting touchStore
            if (shouldTriggerClick && onClick) {
                onClick(event, touchStoreRef.current);
            }
            if (onEnd) {
                onEnd(event, touchStoreRef.current);
            }

            // Reset touchStore

            // set isPressed
            touchStoreRef.current.isPressed = false;

            // set press coordinates
            touchStoreRef.current.origin = null;
            touchStoreRef.current.coordinates = null;
            touchStoreRef.current.isWithinThreshold = false;

            // set isDragging
            touchStoreRef.current.isDragging = false;

            // set isLongPress
            if (longPressTimeout) {
                clearTimeout(longPressTimeout);
                touchStoreRef.current.longPressTimeout = null;
            }
            touchStoreRef.current.isLongPress = false;

            // set isExtraLongPress
            if (extraLongPressTimeout) {
                clearTimeout(extraLongPressTimeout);
                touchStoreRef.current.extraLongPressTimeout = null;
            }
            touchStoreRef.current.isExtraLongPress = false;
        },
        [onClick, onEnd]
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
