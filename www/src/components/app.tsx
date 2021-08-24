import React, { useMemo, useEffect, useCallback } from "react";
import {
    ActionTypes,
    DEFAULT_STATE,
    reducer,
    StateType,
    Store,
    usePassiveStore,
} from "../store";
import { FretboardUtil } from "../utils";
import { Dashboard } from "./dashboard";
import "reset-css";

interface Props {
    oldState?: StateType;
}

function parseItem(key: keyof StateType): any {
    let value: any = localStorage.getItem(key);
    if (value) {
        try {
            value = JSON.parse(value);
            if (key === "fretboards" && Array.isArray(value)) {
                value = value.map(
                    (fretboard) =>
                        new FretboardUtil(fretboard.notes, fretboard.strings)
                );
            }
        } catch (e) {}
    }
    return value;
}

export const App: React.FC<Props> = ({ oldState }) => {
    const store = useMemo(
        () => new Store<StateType, ActionTypes>(DEFAULT_STATE(), reducer),
        []
    );
    const [getState] = usePassiveStore(store);

    useEffect(() => {
        rehydrateState();
        window.addEventListener("beforeunload", saveToLocalStorage);
        return () => {
            saveToLocalStorage();
            window.removeEventListener("beforeunload", saveToLocalStorage);
        };
    }, []);

    const saveToLocalStorage = () => {
        const IGNORE = ["rehydrateSuccess", "isDragging", "scrollToFret"];
        // add in special formatters for keys that were serialized to localStorage
        const HANDLERS: {
            [key in string]: (state: StateType) => any;
        } = {
            fretboards: ({ fretboards }) =>
                fretboards.map((fretboard) => fretboard.toJSON()),
        };

        const state = getState();
        let key: keyof StateType;
        for (key in state) {
            if (IGNORE.includes(key)) continue;
            let value = JSON.stringify(
                HANDLERS.hasOwnProperty(key) ? HANDLERS[key](state) : state[key]
            );
            localStorage.setItem(key, value);
        }
    };

    const rehydrateState = () => {
        let newState;
        if (oldState) {
            newState = {
                ...DEFAULT_STATE(),
                ...oldState,
                rehydrateSuccess: true,
            };
        } else if (
            Object.keys(getState()).some((key) => localStorage.getItem(key))
        ) {
            const defaultState = DEFAULT_STATE();
            newState = {
                fretboards: parseItem("fretboards") || defaultState.fretboards,
                leftDiffs: parseItem("leftDiffs") || defaultState.leftDiffs,
                rightDiffs: parseItem("rightDiffs") || defaultState.rightDiffs,
                label: parseItem("label") || defaultState.label,
                invert: parseItem("invert") || defaultState.invert,
                leftHand: parseItem("leftHand") || defaultState.leftHand,
                stringSize: parseItem("stringSize") || defaultState.stringSize,
                focusedIndex:
                    parseItem("focusedIndex") || defaultState.focusedIndex,
                progress: parseItem("progress") || defaultState.progress,
                rehydrateSuccess: true,
                brushMode: parseItem("brushMode") || defaultState.brushMode,
                isDragging: defaultState.isDragging,
                scrollToFret: defaultState.scrollToFret,
                showInput: parseItem("showInput") || defaultState.showInput,
            };
        }

        if (newState) store.setState(newState);
    };

    return <Dashboard store={store} />;
};
