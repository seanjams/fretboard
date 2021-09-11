import { ActionTypes } from "./actions";
import { getFretboards, StateType, getProgression } from "./state";
import {
    FretboardUtil,
    rebuildDiffs,
    cascadeDiffs,
    DEFAULT_STRINGSWITCH,
} from "../utils";

function NeverCalled(never: never): void {}

export function reducer(state: StateType, action: ActionTypes): StateType {
    let { progressions, currentProgressionIndex } = state;
    let currentProgression = getProgression(state);
    let { focusedIndex, scrollToFret, label } = currentProgression;
    let fretboards = getFretboards(state).map((fretboard) => fretboard.copy());

    if (action.type === "CLEAR_ALL") {
        const newFretboards = Array(fretboards.length)
            .fill(0)
            .map(() => new FretboardUtil());
        progressions[currentProgressionIndex] = {
            ...currentProgression,
            ...rebuildDiffs(newFretboards),
        };

        return {
            ...state,
            ...rebuildDiffs(newFretboards),
        };
    }

    if (action.type === "CLEAR") {
        const { focusedIndex } = action.payload;
        fretboards[focusedIndex] = new FretboardUtil();
        progressions[currentProgressionIndex] = {
            ...currentProgression,
            ...rebuildDiffs(fretboards),
        };

        return {
            ...state,
            progressions,
        };
    }

    if (action.type === "INVERT") {
        return { ...state, invert: !state.invert };
    }

    if (action.type === "LEFT_HAND") {
        return { ...state, leftHand: !state.leftHand };
    }

    if (action.type === "SET_PROGRESSION") {
        const { currentProgressionIndex } = action.payload;
        const fretboards = progressions[currentProgressionIndex].fretboards;
        progressions[currentProgressionIndex] = {
            ...progressions[currentProgressionIndex],
            focusedIndex: 0,
            progress: 0.5,
            ...cascadeDiffs(fretboards, 0),
        };
        return {
            ...state,
            progressions,
            currentProgressionIndex,
        };
    }

    if (action.type === "SET_NOTE") {
        const { note, turnOn } = action.payload;
        const fretboard = fretboards[focusedIndex];

        if (turnOn !== undefined) {
            fretboard.set(note, turnOn);
        } else {
            fretboard.toggle(note);
        }
        fretboard.setName(label);

        progressions[currentProgressionIndex] = {
            ...currentProgression,
            ...cascadeDiffs(fretboards, focusedIndex),
        };

        return { ...state, progressions };
    }

    if (action.type === "SET_NOTES") {
        const { notes } = action.payload;
        const oldFretboard = fretboards[focusedIndex];

        let newFretboard = new FretboardUtil();
        for (let i = 0; i < notes.length; i++) {
            newFretboard.set(notes[i], true);
        }

        // copy highlight to newFretboard
        oldFretboard.strings = DEFAULT_STRINGSWITCH();
        const newFretboards = [oldFretboard, newFretboard];
        cascadeDiffs(newFretboards, 0);

        newFretboard = newFretboards[1];
        newFretboard.setName(label);
        fretboards[focusedIndex] = newFretboard;
        progressions[currentProgressionIndex] = {
            ...currentProgression,
            ...cascadeDiffs(fretboards, focusedIndex),
        };

        return {
            ...state,
            progressions,
        };
    }

    if (action.type === "SET_LABEL") {
        const { label } = action.payload;

        for (let i = 0; i < fretboards.length; i++) {
            fretboards[i].setName(label);
        }

        progressions[currentProgressionIndex] = {
            ...currentProgression,
            ...cascadeDiffs(fretboards, focusedIndex),
            label,
        };

        return { ...state, progressions };
    }

    if (action.type === "INCREMENT_POSITION_X") {
        for (let i = 0; i < fretboards.length; i++) {
            if (i === focusedIndex) {
                fretboards[i].incrementPosition(1, false);
                scrollToFret = fretboards[i].getScrollToFret();
            } else {
                fretboards[i].strings = DEFAULT_STRINGSWITCH();
            }
        }
        progressions[currentProgressionIndex] = {
            ...currentProgression,
            ...cascadeDiffs(fretboards, focusedIndex),
            scrollToFret,
        };

        return {
            ...state,
            progressions,
        };
    }

    if (action.type === "DECREMENT_POSITION_X") {
        for (let i = 0; i < fretboards.length; i++) {
            if (i === focusedIndex) {
                fretboards[i].incrementPosition(-1, false);
                scrollToFret = fretboards[i].getScrollToFret();
            } else {
                fretboards[i].strings = DEFAULT_STRINGSWITCH();
            }
        }
        progressions[currentProgressionIndex] = {
            ...currentProgression,
            ...cascadeDiffs(fretboards, focusedIndex),
            scrollToFret,
        };

        return {
            ...state,
            progressions,
        };
    }

    if (action.type === "INCREMENT_POSITION_Y") {
        for (let i = 0; i < fretboards.length; i++) {
            if (i === focusedIndex) {
                fretboards[i].incrementPosition(1, true);
                scrollToFret = fretboards[i].getScrollToFret();
            } else {
                fretboards[i].strings = DEFAULT_STRINGSWITCH();
            }
        }
        progressions[currentProgressionIndex] = {
            ...currentProgression,
            ...cascadeDiffs(fretboards, focusedIndex),
            scrollToFret,
        };

        return {
            ...state,
            progressions,
        };
    }

    if (action.type === "DECREMENT_POSITION_Y") {
        for (let i = 0; i < fretboards.length; i++) {
            if (i === focusedIndex) {
                fretboards[i].incrementPosition(-1, true);
                scrollToFret = fretboards[i].getScrollToFret();
            } else {
                fretboards[i].strings = DEFAULT_STRINGSWITCH();
            }
        }
        progressions[currentProgressionIndex] = {
            ...currentProgression,
            ...cascadeDiffs(fretboards, focusedIndex),
            scrollToFret,
        };

        return {
            ...state,
            progressions,
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
                fretboards[i].strings = DEFAULT_STRINGSWITCH();
            }
        }
        progressions[currentProgressionIndex] = {
            ...currentProgression,
            ...cascadeDiffs(fretboards, focusedIndex),
        };

        return {
            ...state,
            progressions,
        };
    }

    if (action.type === "ADD_FRETBOARD") {
        const lastIndex = fretboards.length - 1;
        const lastFretboard = fretboards[lastIndex].copy();
        fretboards.push(lastFretboard);
        focusedIndex = fretboards.length - 1;
        progressions[currentProgressionIndex] = {
            ...currentProgression,
            ...cascadeDiffs(fretboards, focusedIndex),
            focusedIndex,
        };
        return {
            ...state,
            progressions,
        };
    }

    if (action.type === "REMOVE_FRETBOARD") {
        if (fretboards.length > 1) fretboards.pop();
        if (focusedIndex >= fretboards.length)
            focusedIndex = fretboards.length - 1;
        progressions[currentProgressionIndex] = {
            ...currentProgression,
            ...rebuildDiffs(fretboards),
            focusedIndex,
        };

        return {
            ...state,
            progressions,
        };
    }

    if (action.type === "SET_FOCUS") {
        const { focusedIndex } = action.payload;
        progressions[currentProgressionIndex] = {
            ...currentProgression,
            focusedIndex,
        };
        return { ...state, progressions };
    }

    if (action.type === "SET_SHOW_INPUT") {
        const { showInput } = action.payload;
        return { ...state, showInput };
    }
    if (action.type === "SET_BRUSH_MODE") {
        const { brushMode } = action.payload;
        return { ...state, brushMode };
    }

    if (action.type === "REHYDRATE") {
        return {
            ...action.payload,
        };
    }

    NeverCalled(action);
}
