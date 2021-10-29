import { BrushModes, LabelTypes, StateType, StringSwitchType } from "../types";
import {} from "./state";
import {
    rebuildDiffs,
    getScrollToFret,
    cascadeDiffs,
    STANDARD_TUNING,
    DEFAULT_STRINGSWITCH,
    incrementPosition,
    setFret,
    getCurrentProgression,
    getCurrentFretboards,
    getCurrentFretboard,
    clearHighlight,
    SELECTED,
} from "../utils";

export const reducers = {
    clearAll(state: StateType): StateType {
        let { progressions, currentProgressionIndex } = state;
        let currentProgression = getCurrentProgression(state);
        let fretboards = getCurrentFretboards(state);

        const newFretboards = Array(fretboards.length)
            .fill(0)
            .map(() => DEFAULT_STRINGSWITCH());
        progressions[currentProgressionIndex] = {
            ...currentProgression,
            ...rebuildDiffs(newFretboards),
        };

        return {
            ...state,
            progressions,
        };
    },

    clear(state: StateType): StateType {
        let { progressions, currentProgressionIndex } = state;
        let currentProgression = getCurrentProgression(state);
        let { focusedIndex, fretboards } = currentProgression;

        fretboards[focusedIndex] = DEFAULT_STRINGSWITCH();
        progressions[currentProgressionIndex] = {
            ...currentProgression,
            ...rebuildDiffs(fretboards),
        };

        return {
            ...state,
            progressions,
        };
    },

    invert(state: StateType): StateType {
        return { ...state, invert: !state.invert };
    },

    leftHand(state: StateType): StateType {
        return { ...state, leftHand: !state.leftHand };
    },

    setProgression(state: StateType): StateType {
        let { progressions, currentProgressionIndex } = state;
        let currentProgression = getCurrentProgression(state);
        let fretboards = getCurrentFretboards(state);

        progressions[currentProgressionIndex] = {
            ...currentProgression,
            focusedIndex: 0,
            ...cascadeDiffs(fretboards, 0),
        };
        return {
            ...state,
            progressions,
        };
    },

    setNotes(state: StateType, notes: number[]) {
        let { progressions, currentProgressionIndex } = state;
        let currentProgression = getCurrentProgression(state);
        let { focusedIndex, label } = currentProgression;
        let fretboards = getCurrentFretboards(state);

        let newFretboard = DEFAULT_STRINGSWITCH();
        for (let i = 0; i < notes.length; i++) {
            setFret(newFretboard, 0, STANDARD_TUNING[0] + i + 8, SELECTED);
        }

        // copy highlight to newFretboard
        const oldFretboard: StringSwitchType = [...getCurrentFretboard(state)];
        let newFretboards = cascadeDiffs(
            [oldFretboard, newFretboard],
            0
        ).fretboards;

        fretboards[focusedIndex] = newFretboards[1];
        progressions[currentProgressionIndex] = {
            ...currentProgression,
            ...cascadeDiffs(fretboards, focusedIndex),
        };

        return {
            ...state,
            progressions,
        };
    },

    setLabel(state: StateType, label: LabelTypes): StateType {
        let { progressions, currentProgressionIndex } = state;
        let currentProgression = getCurrentProgression(state);

        progressions[currentProgressionIndex] = {
            ...currentProgression,
            label,
        };

        return { ...state, progressions };
    },

    _incrementPosition(
        state: StateType,
        inc: number,
        vertical: boolean
    ): StateType {
        let { progressions, currentProgressionIndex } = state;
        let currentProgression = getCurrentProgression(state);
        let { focusedIndex, scrollToFret } = currentProgression;
        let fretboards = getCurrentFretboards(state);

        for (let i = 0; i < fretboards.length; i++) {
            if (i === focusedIndex) {
                incrementPosition(fretboards[i], inc, vertical);
                scrollToFret = getScrollToFret(fretboards[i]);

                console.log(scrollToFret);
            } else {
                clearHighlight(fretboards[i]);
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
    },

    incrementPositionX(state: StateType) {
        return this._incrementPosition(state, 1, false);
    },

    decrementPositionX(state: StateType) {
        return this._incrementPosition(state, -1, false);
    },

    incrementPositionY(state: StateType) {
        return this._incrementPosition(state, 1, true);
    },

    decrementPositionY(state: StateType) {
        return this._incrementPosition(state, -1, true);
    },

    setHighlightedNote(
        state: StateType,
        stringIndex: number,
        value: number,
        brushMode: BrushModes
    ): StateType {
        let { progressions, currentProgressionIndex } = state;
        let currentProgression = getCurrentProgression(state);
        let { focusedIndex } = currentProgression;
        let fretboards = getCurrentFretboards(state);

        for (let i = 0; i < fretboards.length; i++) {
            if (i === focusedIndex) {
                setFret(fretboards[i], stringIndex, value, brushMode);
            } else {
                clearHighlight(fretboards[i]);
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
    },

    addFretboard(state: StateType) {
        let { progressions, currentProgressionIndex } = state;
        let currentProgression = getCurrentProgression(state);
        let { focusedIndex } = currentProgression;
        let fretboards = getCurrentFretboards(state);

        const lastIndex = fretboards.length - 1;
        fretboards.push({ ...fretboards[lastIndex] });
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
    },

    removeFretboard(state: StateType): StateType {
        let { progressions, currentProgressionIndex } = state;
        let currentProgression = getCurrentProgression(state);
        let { focusedIndex } = currentProgression;
        let fretboards = getCurrentFretboards(state);

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
    },

    setFocusedIndex(state: StateType, focusedIndex: number): StateType {
        let { progressions, currentProgressionIndex } = state;
        let currentProgression = getCurrentProgression(state);

        progressions[currentProgressionIndex] = {
            ...currentProgression,
            focusedIndex,
        };
        return { ...state, progressions };
    },

    setShowInput(state: StateType, showInput: boolean): StateType {
        return { ...state, showInput };
    },

    setBrushMode(state: StateType, brushMode: BrushModes): StateType {
        return { ...state, brushMode };
    },
};
