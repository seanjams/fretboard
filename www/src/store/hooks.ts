import { useEffect, useState, useRef, useCallback } from "react";
import { ActionTypes } from "./actions";
import { Store } from "./store";
import {
    StateType,
    ProgressionStateType,
    getProgression,
    getFretboard,
} from "./state";
import { FretboardUtilType } from "../utils";

interface DragStore {
    isDragging: boolean;
}

export function useStore<T, A, Keys extends (keyof T)[]>(
    store: Store<T, A>,
    keys: Keys
) {
    let fullStateUpdate = !keys.length;
    let initialState: Partial<T> = {};
    if (fullStateUpdate) {
        initialState = store.state;
    } else {
        for (let i in keys) initialState[keys[i]] = store.state[keys[i]];
    }

    const [partialState, setPartialState] = useState<Partial<T>>(initialState);
    const partialRef = useRef<Partial<T>>(partialState); // to track updates
    const updatedStateRef = useRef<T>(store.state); // to return
    partialRef.current = partialState;

    useEffect(() => {
        const destroy = store.addListener((newState) => {
            let update = false;
            let partialState: Partial<T> = {};

            if (fullStateUpdate) {
                partialState = newState;
                update = true;
            } else {
                for (let i in keys) {
                    if (newState[keys[i]] !== partialRef.current[keys[i]])
                        update = true;
                    partialState[keys[i]] = newState[keys[i]];
                }
            }

            if (update) {
                updatedStateRef.current = newState;
                setPartialState(partialState);
            }
        });
        return () => {
            destroy();
        };
    }, [store]);

    return [() => updatedStateRef.current] as const;
}

export function usePassiveStore<T, A, Keys extends (keyof T)[]>(
    store: Store<T, A>,
    keys: Keys
) {
    let fullStateUpdate = !keys.length;
    let initialState: Partial<T> = {};
    if (fullStateUpdate) {
        initialState = store.state;
    } else {
        for (let i in keys) initialState[keys[i]] = store.state[keys[i]];
    }

    const partialRef = useRef<Partial<T>>(initialState);
    const updatedStateRef = useRef<T>(store.state);

    useEffect(() => {
        const destroy = store.addListener((newState) => {
            let update = false;
            let partialState: Partial<T> = {};

            if (fullStateUpdate) {
                partialState = newState;
                update = true;
            } else {
                for (let i in keys) {
                    if (newState[keys[i]] !== partialRef.current[keys[i]])
                        update = true;
                    partialState[keys[i]] = newState[keys[i]];
                }
            }

            if (update) {
                updatedStateRef.current = newState;
                partialRef.current = partialState;
            }
        });
        return () => {
            destroy();
        };
    }, [store]);

    return [() => updatedStateRef.current] as const;
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

export function useCurrentProgression(
    store: Store<StateType, ActionTypes>,
    keys: (keyof ProgressionStateType)[]
) {
    const currentProgression = getProgression(store.state);
    let initialState: Partial<ProgressionStateType> = {};
    keys.forEach(<Key extends keyof ProgressionStateType>(key: Key) => {
        initialState[key] = currentProgression[key];
    });

    const [partialState, setPartialState] =
        useState<Partial<ProgressionStateType>>(initialState);
    const partialRef = useRef<Partial<ProgressionStateType>>(partialState);
    partialRef.current = partialState;
    const updatedProgressionStateRef =
        useRef<ProgressionStateType>(currentProgression);
    updatedProgressionStateRef.current = currentProgression;

    useEffect(() => {
        const destroy = store.addListener((newState) => {
            const currentProgression = getProgression(newState);

            let update = false;
            let state: Partial<ProgressionStateType> = {};
            keys.forEach(<Key extends keyof ProgressionStateType>(key: Key) => {
                if (currentProgression[key] !== partialRef.current[key])
                    update = true;
                state[key] = currentProgression[key];
            });

            if (update) {
                updatedProgressionStateRef.current = currentProgression;
                setPartialState(state);
            }
        });
        return () => {
            destroy();
        };
    }, [store]);

    return [() => updatedProgressionStateRef.current] as const;
}

export function useCurrentFretboard(
    store: Store<StateType, ActionTypes>,
    keys: (keyof FretboardUtilType)[]
) {
    const fretboard = getFretboard(store.state).toJSON();
    let initialState: Partial<FretboardUtilType> = {};
    keys.forEach(<Key extends keyof FretboardUtilType>(key: Key) => {
        initialState[key] = fretboard[key];
    });

    const [partialState, setPartialState] =
        useState<Partial<FretboardUtilType>>(initialState);
    const partialRef = useRef<Partial<FretboardUtilType>>(partialState);
    partialRef.current = partialState;
    const updatedFretboardStateRef = useRef<FretboardUtilType>(fretboard);
    updatedFretboardStateRef.current = fretboard;

    useEffect(() => {
        const destroy = store.addListener((newState) => {
            let { label } = getProgression(newState);
            let currentFretboard = getFretboard(newState).toJSON();

            let update = false;
            let state: Partial<FretboardUtilType> = {};
            keys.forEach(<Key extends keyof FretboardUtilType>(key: Key) => {
                if (currentFretboard[key] !== partialRef.current[key])
                    update = true;
                state[key] = currentFretboard[key];
            });

            if (update) {
                updatedFretboardStateRef.current = currentFretboard;
                setPartialState(state);
            }
        });
        return () => {
            destroy();
        };
    }, [store]);

    return [() => updatedFretboardStateRef.current] as const;
}
