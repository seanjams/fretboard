import {
    StatusTypes,
    StringSwitchType,
    DiffType,
    LabelTypes,
    StrumTypes,
    DragStatusTypes,
} from "../types";
import {
    rebuildDiffs,
    getScrollToFret,
    cascadeDiffs,
    moveHighight,
    setFret,
    clearHighlight,
    DEFAULT_STRINGSWITCH,
    STANDARD_TUNING,
    SELECTED,
    HIGHLIGHTED,
    STRUM_LOW_TO_HIGH,
    getNotes,
} from "../utils";
import { Store } from "./store";

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

export interface AppStateType {
    progressions: ProgressionStateType[];
    invert?: boolean;
    leftHand?: boolean;
    status: StatusTypes;
    showInput: boolean;
    showSettings: boolean;
    currentProgressionIndex: number;
    strumMode: StrumTypes;
}

// Helper functions
export function currentProgression(state: AppStateType): ProgressionStateType {
    return state.progressions[state.currentProgressionIndex];
}

export function currentFretboard(state: AppStateType): StringSwitchType {
    const progression = currentProgression(state);
    return progression.fretboards[progression.focusedIndex];
}

export function getComputedAppState(state: AppStateType): AppStateType & {
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
export const appReducers = {
    clearAll(state: AppStateType) {
        let progression = getComputedAppState(state).progression;
        let { fretboards } = progression;

        const newFretboards = Array(fretboards.length)
            .fill(0)
            .map(() => DEFAULT_STRINGSWITCH());

        return this.setCurrentProgression(
            { ...state, status: SELECTED },
            {
                ...progression,
                ...rebuildDiffs(newFretboards),
            }
        );
    },

    clear(state: AppStateType) {
        let progression = getComputedAppState(state).progression;
        let { focusedIndex, fretboards } = progression;

        fretboards[focusedIndex] = DEFAULT_STRINGSWITCH();
        return this.setCurrentProgression(
            { ...state, status: SELECTED },
            {
                ...progression,
                ...rebuildDiffs([...fretboards]),
            }
        );
    },

    clearHighlight(state: AppStateType) {
        let progression = getComputedAppState(state).progression;
        let { focusedIndex, fretboards } = progression;

        clearHighlight(fretboards[focusedIndex]);
        return this.setCurrentProgression(state, {
            ...progression,
            ...rebuildDiffs([...fretboards]),
        });
    },

    incrementPosition(state: AppStateType, inc: number, vertical: boolean) {
        let progression = getComputedAppState(state).progression;
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

    incrementPositionX(state: AppStateType) {
        return this.incrementPosition(state, 1, false);
    },

    decrementPositionX(state: AppStateType) {
        return this.incrementPosition(state, -1, false);
    },

    incrementPositionY(state: AppStateType) {
        return this.incrementPosition(state, 1, true);
    },

    decrementPositionY(state: AppStateType) {
        return this.incrementPosition(state, -1, true);
    },

    setHighlightedNote(
        state: AppStateType,
        stringIndex: number,
        value: number,
        status: StatusTypes
    ) {
        let progression = getComputedAppState(state).progression;
        let { focusedIndex, fretboards } = progression;

        for (let i = 0; i < fretboards.length; i++) {
            if (i === focusedIndex) {
                setFret(fretboards[i], stringIndex, value, status);
            } else {
                clearHighlight(fretboards[i]);
            }
        }

        const notes = getNotes(fretboards[focusedIndex]);
        let empty = !notes.some((note) => note === SELECTED);

        return this.setCurrentProgression(
            {
                ...state,
                status: empty ? SELECTED : state.status,
            },
            {
                ...progression,
                ...cascadeDiffs(fretboards, focusedIndex),
            }
        );
    },

    addFretboard(state: AppStateType) {
        let progression = getComputedAppState(state).progression;
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

    removeFretboard(state: AppStateType) {
        let progression = getComputedAppState(state).progression;
        let { focusedIndex, fretboards } = progression;

        if (fretboards.length > 1) fretboards = fretboards.slice(0, -1);
        if (focusedIndex >= fretboards.length)
            focusedIndex = fretboards.length - 1;

        return this.setCurrentProgression(state, {
            ...progression,
            // ...rebuildDiffs(fretboards),
            ...cascadeDiffs(fretboards, focusedIndex),
            focusedIndex,
        });
    },

    setFocusedIndex(state: AppStateType, focusedIndex: number) {
        let progression = getComputedAppState(state).progression;
        let { fretboards } = progression;
        focusedIndex = Math.max(focusedIndex, 0);
        focusedIndex = Math.min(focusedIndex, fretboards.length - 1);

        return this.setCurrentProgression(state, {
            ...progression,
            focusedIndex,
        });
    },

    setShowInput(state: AppStateType, showInput: boolean) {
        const showSettings = showInput ? false : state.showSettings;
        return { ...state, showSettings, showInput };
    },

    setShowSettings(state: AppStateType, showSettings: boolean) {
        const showInput = showSettings ? false : state.showInput;
        return { ...state, showSettings, showInput };
    },

    setStatus(state: AppStateType, status: StatusTypes) {
        return { ...state, status };
    },

    setStrumMode(state: AppStateType, strumMode: StrumTypes) {
        return { ...state, strumMode };
    },

    toggleLeftHand(state: AppStateType) {
        const leftHand = !state.leftHand;
        return { ...state, leftHand };
    },

    toggleInvert(state: AppStateType) {
        const invert = !state.invert;
        return { ...state, invert };
    },

    setCurrentProgression(
        state: AppStateType,
        progression: ProgressionStateType
    ): AppStateType {
        let { progressions, currentProgressionIndex } = state;
        progressions = [...progressions];
        progressions[currentProgressionIndex] = progression;
        return { ...state, progressions };
    },
};

// Store
export class AppStore extends Store<AppStateType, typeof appReducers> {
    constructor() {
        super(DEFAULT_MAIN_STATE(), appReducers);
    }

    getComputedState() {
        return getComputedAppState(this.state);
    }
}

// Default State
const fretboards1: StringSwitchType[] = [
    DEFAULT_STRINGSWITCH(),
    DEFAULT_STRINGSWITCH(),
    DEFAULT_STRINGSWITCH(),
];

setFret(fretboards1[0], 0, STANDARD_TUNING[0] + 7, SELECTED);
setFret(fretboards1[0], 1, STANDARD_TUNING[1] + 10, HIGHLIGHTED);
setFret(fretboards1[0], 2, STANDARD_TUNING[2] + 7, HIGHLIGHTED);
setFret(fretboards1[0], 3, STANDARD_TUNING[3] + 9, HIGHLIGHTED);
setFret(fretboards1[0], 4, STANDARD_TUNING[4] + 9, HIGHLIGHTED);
setFret(fretboards1[0], 5, STANDARD_TUNING[5] + 7, SELECTED);

setFret(fretboards1[1], 0, STANDARD_TUNING[0] + 5, SELECTED);
setFret(fretboards1[1], 1, STANDARD_TUNING[1] + 7, SELECTED);
setFret(fretboards1[1], 2, STANDARD_TUNING[2] + 5, SELECTED);
setFret(fretboards1[1], 3, STANDARD_TUNING[3] + 6, SELECTED);
setFret(fretboards1[1], 4, STANDARD_TUNING[4] + 5, SELECTED);
setFret(fretboards1[1], 5, STANDARD_TUNING[5] + 5, SELECTED);

setFret(fretboards1[2], 0, STANDARD_TUNING[0] + 5, SELECTED);
setFret(fretboards1[2], 1, STANDARD_TUNING[1] + 5, SELECTED);
setFret(fretboards1[2], 2, STANDARD_TUNING[2] + 7, SELECTED);
setFret(fretboards1[2], 3, STANDARD_TUNING[3] + 6, SELECTED);
setFret(fretboards1[2], 4, STANDARD_TUNING[4] + 7, SELECTED);
setFret(fretboards1[2], 5, STANDARD_TUNING[5] + 5, SELECTED);

const progression1: ProgressionStateType = {
    ...cascadeDiffs(fretboards1, 0),
    focusedIndex: 0,
    scrollToFret: 0,
    label: "flat",
    hiddenFretboardIndices: [],
};
const progression2: ProgressionStateType = {
    ...cascadeDiffs(fretboards1, 0),
    focusedIndex: 0,
    scrollToFret: 0,
    label: "flat",
    hiddenFretboardIndices: [],
};
const progression3: ProgressionStateType = {
    ...cascadeDiffs(fretboards1, 0),
    focusedIndex: 0,
    scrollToFret: 0,
    label: "flat",
    hiddenFretboardIndices: [],
};

export function DEFAULT_MAIN_STATE(): AppStateType {
    return {
        progressions: [progression1, progression2, progression3],
        invert: false,
        leftHand: false,
        status: 1,
        showInput: false,
        showSettings: false,
        currentProgressionIndex: 0,
        strumMode: STRUM_LOW_TO_HIGH,
    };
}
