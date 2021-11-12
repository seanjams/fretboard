import {
    StatusTypes,
    ProgressionStateType,
    StateType,
    SliderStateType,
} from "../types";
import {} from "./state";
import {
    rebuildDiffs,
    getScrollToFret,
    cascadeDiffs,
    DEFAULT_STRINGSWITCH,
    moveHighight,
    setFret,
    currentProgression,
    currentFretboards,
    clearHighlight,
} from "../utils";

export const sliderReducers = {
    setProgress(state: SliderStateType, progress: number): SliderStateType {
        // dangerous method, does not return new state object on purpose, use with caution
        state.progress = progress;
        return state;
    },
};

export const reducers = {
    clearAll(state: StateType): StateType {
        let { progressions, currentProgressionIndex } = state;
        let progression = currentProgression(state);
        let fretboards = currentFretboards(state);

        const newFretboards = Array(fretboards.length)
            .fill(0)
            .map(() => DEFAULT_STRINGSWITCH());
        progressions[currentProgressionIndex] = {
            ...progression,
            ...rebuildDiffs(newFretboards),
        };

        return {
            ...state,
            progressions,
        };
    },

    clear(state: StateType): StateType {
        let { progressions, currentProgressionIndex } = state;
        let progression = currentProgression(state);
        let { focusedIndex, fretboards } = progression;

        fretboards[focusedIndex] = DEFAULT_STRINGSWITCH();
        progressions[currentProgressionIndex] = {
            ...progression,
            ...rebuildDiffs([...fretboards]),
        };

        return {
            ...state,
            progressions,
        };
    },

    _incrementPosition(
        state: StateType,
        inc: number,
        vertical: boolean
    ): StateType {
        let { progressions, currentProgressionIndex } = state;
        let progression = currentProgression(state);
        let { focusedIndex, scrollToFret } = progression;
        let fretboards = currentFretboards(state);

        for (let i = 0; i < fretboards.length; i++) {
            if (i === focusedIndex) {
                moveHighight(fretboards[i], inc, vertical);
                scrollToFret = getScrollToFret(fretboards[i]);
            } else {
                clearHighlight(fretboards[i]);
            }
        }

        progressions[currentProgressionIndex] = {
            ...progression,
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
        status: StatusTypes
    ): StateType {
        let { progressions, currentProgressionIndex } = state;
        let progression = currentProgression(state);
        let { focusedIndex } = progression;
        let fretboards = currentFretboards(state);

        for (let i = 0; i < fretboards.length; i++) {
            if (i === focusedIndex) {
                setFret(fretboards[i], stringIndex, value, status);
            } else {
                clearHighlight(fretboards[i]);
            }
        }
        progressions[currentProgressionIndex] = {
            ...progression,
            ...cascadeDiffs(fretboards, focusedIndex),
        };

        return {
            ...state,
            progressions,
        };
    },

    addFretboard(state: StateType) {
        let { progressions, currentProgressionIndex } = state;
        let progression = currentProgression(state);
        let { focusedIndex } = progression;
        let fretboards = currentFretboards(state);

        const lastIndex = fretboards.length - 1;
        fretboards.push(JSON.parse(JSON.stringify(fretboards[lastIndex])));
        focusedIndex = fretboards.length - 1;
        progressions[currentProgressionIndex] = {
            ...progression,
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
        let progression = currentProgression(state);
        let { focusedIndex } = progression;
        let fretboards = currentFretboards(state);

        if (fretboards.length > 1) fretboards.pop();
        if (focusedIndex >= fretboards.length)
            focusedIndex = fretboards.length - 1;
        progressions[currentProgressionIndex] = {
            ...progression,
            ...rebuildDiffs([...fretboards]),
            focusedIndex,
        };

        return {
            ...state,
            progressions,
        };
    },

    setFocusedIndex(state: StateType, focusedIndex: number): StateType {
        let { progressions, currentProgressionIndex } = state;
        let progression = currentProgression(state);
        let { fretboards } = progression;
        focusedIndex = Math.max(focusedIndex, 0);
        focusedIndex = Math.min(focusedIndex, fretboards.length - 1);

        progressions[currentProgressionIndex] = {
            ...progression,
            focusedIndex,
        };
        return { ...state, progressions };
    },

    setShowInput(state: StateType, showInput: boolean): StateType {
        return { ...state, showInput };
    },

    setStatus(state: StateType, status: StatusTypes): StateType {
        return { ...state, status };
    },

    setCurrentProgression(
        state: StateType,
        progression: ProgressionStateType
    ): StateType {
        let { progressions, currentProgressionIndex } = state;
        progressions = [...progressions];
        progressions[currentProgressionIndex] = progression;
        return { ...state, progressions };
    },
};
