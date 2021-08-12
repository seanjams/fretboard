import { ActionTypes } from "./actions";
import { StateType } from "./state";
import {
    FretboardUtil,
    rebuildDiffs,
    cascadeDiffs,
    DEFAULT_STRINGSWITCH,
} from "../utils";

function NeverCalled(never: never): void {}

export function reducer(state: StateType, action: ActionTypes): StateType {
    let { fretboards, focusedIndex, scrollToFret, showInput } = state;
    fretboards = fretboards.map((fretboard) => fretboard.copy());

    if (action.type === "CLEAR_ALL") {
        const newFretboards = Array(fretboards.length)
            .fill(0)
            .map(() => new FretboardUtil());
        return {
            ...state,
            ...rebuildDiffs(newFretboards),
        };
    }

    if (action.type === "CLEAR") {
        const { focusedIndex } = action.payload;
        fretboards[focusedIndex] = new FretboardUtil();
        return {
            ...state,
            ...rebuildDiffs(fretboards),
        };
    }

    if (action.type === "INVERT") {
        return { ...state, invert: !state.invert };
    }

    if (action.type === "LEFT_HAND") {
        return { ...state, leftHand: !state.leftHand };
    }

    if (action.type === "SET_NOTE") {
        const { note, turnOn } = action.payload;
        const fretboard = fretboards[focusedIndex];

        if (turnOn !== undefined) {
            fretboard.set(note, turnOn);
        } else {
            fretboard.toggle(note);
        }

        return { ...state, ...rebuildDiffs(fretboards) };
    }

    if (action.type === "SET_LABEL") {
        const { label } = action.payload;
        return { ...state, label };
    }

    if (action.type === "INCREMENT_POSITION_X") {
        for (let i = 0; i < fretboards.length; i++) {
            if (i === focusedIndex) {
                fretboards[i].incrementPosition(1, false);
                scrollToFret = fretboards[i].getScrollToFret();
            } else {
                fretboards[i].strings = DEFAULT_STRINGSWITCH;
            }
        }

        return {
            ...state,
            scrollToFret,
            ...cascadeDiffs(fretboards, focusedIndex),
        };
    }

    if (action.type === "DECREMENT_POSITION_X") {
        for (let i = 0; i < fretboards.length; i++) {
            if (i === focusedIndex) {
                fretboards[i].incrementPosition(-1, false);
                scrollToFret = fretboards[i].getScrollToFret();
            } else {
                fretboards[i].strings = DEFAULT_STRINGSWITCH;
            }
        }

        return {
            ...state,
            scrollToFret,
            ...cascadeDiffs(fretboards, focusedIndex),
        };
    }

    if (action.type === "INCREMENT_POSITION_Y") {
        for (let i = 0; i < fretboards.length; i++) {
            if (i === focusedIndex) {
                fretboards[i].incrementPosition(1, true);
                scrollToFret = fretboards[i].getScrollToFret();
            } else {
                fretboards[i].strings = DEFAULT_STRINGSWITCH;
            }
        }

        return {
            ...state,
            scrollToFret,
            ...cascadeDiffs(fretboards, focusedIndex),
        };
    }

    if (action.type === "DECREMENT_POSITION_Y") {
        for (let i = 0; i < fretboards.length; i++) {
            if (i === focusedIndex) {
                fretboards[i].incrementPosition(-1, true);
                scrollToFret = fretboards[i].getScrollToFret();
            } else {
                fretboards[i].strings = DEFAULT_STRINGSWITCH;
            }
        }

        return {
            ...state,
            scrollToFret,
            ...cascadeDiffs(fretboards, focusedIndex),
        };
    }

    if (action.type === "SET_HIGHLIGHTED_NOTE") {
        const { stringIndex, value, turnOn } = action.payload;

        for (let i = 0; i < fretboards.length; i++) {
            if (i === focusedIndex) {
                if (turnOn !== undefined) {
                    fretboards[i].setFret(stringIndex, value, turnOn);
                } else {
                    fretboards[i].toggleFret(stringIndex, value);
                }
            } else {
                fretboards[i].strings = DEFAULT_STRINGSWITCH;
            }
        }

        return { ...state, ...cascadeDiffs(fretboards, focusedIndex) };
    }

    if (action.type === "ADD_FRETBOARD") {
        const lastIndex = fretboards.length - 1;
        const lastFretboard = fretboards[lastIndex].copy();
        fretboards.push(lastFretboard);
        focusedIndex = fretboards.length - 1;
        showInput = true;
        return {
            ...state,
            focusedIndex,
            showInput,
            ...cascadeDiffs(fretboards, lastIndex),
        };
    }

    if (action.type === "REMOVE_FRETBOARD") {
        let { focusedIndex } = state;
        if (fretboards.length > 1) fretboards.pop();
        if (focusedIndex >= fretboards.length)
            focusedIndex = fretboards.length - 1;

        return {
            ...state,
            focusedIndex,
            ...rebuildDiffs(fretboards),
        };
    }

    if (action.type === "SET_FOCUS") {
        const { focusedIndex } = action.payload;
        return { ...state, focusedIndex };
    }

    if (action.type === "REHYDRATE") {
        return {
            ...action.payload,
        };
    }

    NeverCalled(action);
}
