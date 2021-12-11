import React, { useMemo, useEffect } from "react";
import "reset-css";
import {
    DEFAULT_MAIN_STATE,
    DEFAULT_SLIDER_STATE,
    Store,
    reducers,
    sliderReducers,
    StateType,
    currentProgression,
    current,
} from "../store";
import { NATURAL_NOTE_NAMES, B, C, E, F } from "../utils";
import { Dashboard } from "./dashboard";
// import { Menu } from "./menu";

interface Props {
    oldState?: StateType;
}

export const App: React.FC<Props> = ({ oldState }) => {
    const store = useMemo(() => new Store(DEFAULT_MAIN_STATE(), reducers), []);
    const sliderStore = useMemo(
        () => new Store(DEFAULT_SLIDER_STATE(), sliderReducers),
        []
    );

    useEffect(() => {
        rehydrateState();
        window.addEventListener("beforeunload", saveToLocalStorage);
        window.addEventListener("keydown", onKeyPress);
        return () => {
            saveToLocalStorage();
            window.removeEventListener("beforeunload", saveToLocalStorage);
            window.removeEventListener("keydown", onKeyPress);
        };
    }, []);

    const saveToLocalStorage = () => {
        localStorage.setItem("state", JSON.stringify(store.state));
    };

    const rehydrateState = () => {
        // rehydrate main state
        let newState: StateType;
        if (oldState) {
            newState = {
                ...DEFAULT_MAIN_STATE(),
                ...oldState,
            };
        } else {
            let parsedState = {};
            if (localStorage.getItem("state")) {
                parsedState =
                    JSON.parse(localStorage.getItem("state") || "") || {};
            }
            newState = {
                ...DEFAULT_MAIN_STATE(),
                ...parsedState,
            };
        }
        store.setState(newState);

        // rehydrate slider state
        const { focusedIndex } = currentProgression(newState);
        sliderStore.setState({
            progress: focusedIndex + 0.5,
            rehydrateSuccess: true,
        });
    };

    // move this?
    function onKeyPress(this: Window, e: KeyboardEvent): any {
        const { invert, leftHand, progression } = current(store.state);
        const { label } = progression;
        const direction = e.key;
        // Get the action direction based on orientation of fretboard
        // could maybe move this to reducer.
        // highEBottom
        // 	- whether the high E string appears on the top or bottom of the fretboard,
        // 	- depending on invert/leftHand views
        const highEBottom = invert !== leftHand;
        const keyMap: { [key in string]: () => StateType } = {
            ArrowUp: highEBottom
                ? store.dispatch.decrementPositionY
                : store.dispatch.incrementPositionY,
            ArrowDown: highEBottom
                ? store.dispatch.incrementPositionY
                : store.dispatch.decrementPositionY,
            ArrowRight: invert
                ? store.dispatch.decrementPositionX
                : store.dispatch.incrementPositionX,
            ArrowLeft: invert
                ? store.dispatch.incrementPositionX
                : store.dispatch.decrementPositionX,
        };

        if (keyMap[direction]) {
            e.preventDefault();
            keyMap[direction]();
        } else {
            let naturals: { [key in string]: number } = {};
            let i = 0;
            for (let name of NATURAL_NOTE_NAMES) {
                if (label === "flat") {
                    naturals[name] = i;
                    if (name !== F && name !== C) i++;
                    naturals[name.toLowerCase()] = i;
                    i++;
                } else if (label === "sharp") {
                    naturals[name.toLowerCase()] = i;
                    if (name !== E && name !== B) i++;
                    naturals[name] = i;
                    i++;
                }
            }

            if (naturals.hasOwnProperty(e.key)) {
                e.preventDefault();
                store.dispatch.setNote(naturals[e.key]);
            }
        }
    }

    return <div>{<Dashboard store={store} sliderStore={sliderStore} />}</div>;
};
