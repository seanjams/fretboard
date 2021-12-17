import { StatusTypes, StringSwitchType, DiffType, LabelTypes } from "../types";
import {
    rebuildDiffs,
    getScrollToFret,
    cascadeDiffs,
    moveHighight,
    setFret,
    clearHighlight,
    DEFAULT_STRINGSWITCH,
} from "../utils";
import { Store } from "./store";
import { DEFAULT_MAIN_STATE, DEFAULT_SLIDER_STATE } from "./defaultState";

// Types

export interface ProgressionStateType {
    fretboards: StringSwitchType[];
    leftDiffs: DiffType[];
    rightDiffs: DiffType[];
    focusedIndex: number;
    scrollToFret: number;
    label: LabelTypes;
    hiddenFretboardIndices: number[];
}

export interface StateType {
    progressions: ProgressionStateType[];
    invert?: boolean;
    leftHand?: boolean;
    status: StatusTypes;
    showInput: boolean;
    currentProgressionIndex: number;
}

export interface SliderStateType {
    progress: number;
    rehydrateSuccess: boolean;
}

// Helper functions
export function currentProgression(state: StateType): ProgressionStateType {
    return state.progressions[state.currentProgressionIndex];
}

export function currentFretboard(state: StateType): StringSwitchType {
    const progression = currentProgression(state);
    return progression.fretboards[progression.focusedIndex];
}

export function current(state: StateType): StateType & {
    progression: ProgressionStateType;
    fretboard: StringSwitchType;
} {
    return {
        ...state,
        progression: currentProgression(state),
        fretboard: currentFretboard(state),
    };
}

// Reducers
export const sliderReducers = {
    setProgress(state: SliderStateType, progress: number): SliderStateType {
        // dangerous method, does not return new state object on purpose, use with caution
        state.progress = progress;
        return state;
    },
};

export class SliderStore extends Store<SliderStateType, typeof sliderReducers> {
    constructor() {
        super(DEFAULT_SLIDER_STATE(), sliderReducers);
    }
}

export const reducers = {
    clearAll(state: StateType) {
        let progression = current(state).progression;
        let { fretboards } = progression;

        const newFretboards = Array(fretboards.length)
            .fill(0)
            .map(() => DEFAULT_STRINGSWITCH());

        return this.setCurrentProgression(state, {
            ...progression,
            ...rebuildDiffs(newFretboards),
        });
    },

    clear(state: StateType) {
        let progression = current(state).progression;
        let { focusedIndex, fretboards } = progression;

        fretboards[focusedIndex] = DEFAULT_STRINGSWITCH();
        return this.setCurrentProgression(state, {
            ...progression,
            ...rebuildDiffs([...fretboards]),
        });
    },

    incrementPosition(state: StateType, inc: number, vertical: boolean) {
        let progression = current(state).progression;
        let { focusedIndex, scrollToFret, fretboards } = progression;

        for (let i = 0; i < fretboards.length; i++) {
            if (i === focusedIndex) {
                moveHighight(fretboards[i], inc, vertical);
                scrollToFret = getScrollToFret(fretboards[i]);
            } else {
                clearHighlight(fretboards[i]);
            }
        }

        return this.setCurrentProgression(state, {
            ...progression,
            ...cascadeDiffs(fretboards, focusedIndex),
            scrollToFret,
        });
    },

    incrementPositionX(state: StateType) {
        return this.incrementPosition(state, 1, false);
    },

    decrementPositionX(state: StateType) {
        return this.incrementPosition(state, -1, false);
    },

    incrementPositionY(state: StateType) {
        return this.incrementPosition(state, 1, true);
    },

    decrementPositionY(state: StateType) {
        return this.incrementPosition(state, -1, true);
    },

    setHighlightedNote(
        state: StateType,
        stringIndex: number,
        value: number,
        status: StatusTypes
    ) {
        let progression = current(state).progression;
        let { focusedIndex, fretboards } = progression;

        for (let i = 0; i < fretboards.length; i++) {
            if (i === focusedIndex) {
                setFret(fretboards[i], stringIndex, value, status);
            } else {
                clearHighlight(fretboards[i]);
            }
        }

        return this.setCurrentProgression(state, {
            ...progression,
            ...cascadeDiffs(fretboards, focusedIndex),
        });
    },

    addFretboard(state: StateType) {
        let progression = current(state).progression;
        let { focusedIndex, fretboards } = progression;

        const lastIndex = fretboards.length - 1;
        fretboards.push(JSON.parse(JSON.stringify(fretboards[lastIndex])));
        focusedIndex = fretboards.length - 1;

        return this.setCurrentProgression(state, {
            ...progression,
            ...cascadeDiffs(fretboards, focusedIndex),
            focusedIndex,
        });
    },

    removeFretboard(state: StateType) {
        let progression = current(state).progression;
        let { focusedIndex, fretboards } = progression;

        if (fretboards.length > 1) fretboards.pop();
        if (focusedIndex >= fretboards.length)
            focusedIndex = fretboards.length - 1;

        return this.setCurrentProgression(state, {
            ...progression,
            ...rebuildDiffs([...fretboards]),
            focusedIndex,
        });
    },

    setFocusedIndex(state: StateType, focusedIndex: number) {
        let progression = current(state).progression;
        let { fretboards } = progression;
        focusedIndex = Math.max(focusedIndex, 0);
        focusedIndex = Math.min(focusedIndex, fretboards.length - 1);

        return this.setCurrentProgression(state, {
            ...progression,
            focusedIndex,
        });
    },

    setShowInput(state: StateType, showInput: boolean) {
        return { ...state, showInput };
    },

    setStatus(state: StateType, status: StatusTypes) {
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

export class AppStore extends Store<StateType, typeof reducers> {
    constructor() {
        super(DEFAULT_MAIN_STATE(), reducers);
    }
}
