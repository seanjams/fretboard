import moment from "moment";
import {
    ArrowTypes,
    ChordTypes,
    DisplayTypes,
    DragStatusTypes,
    FretboardDiffType,
    FretboardType,
    LabelTypes,
    StatusTypes,
    StrumTypes,
} from "../types";
import {
    buildFretboardByChordName,
    cascadeDiffs,
    clearHighlight,
    DEFAULT_FRETBOARD,
    DEFAULT_PROGRESSION,
    getFretboardNames,
    getScrollToFret,
    HIGHLIGHTED,
    moveHighight,
    rebuildDiffs,
    SELECTED,
    setFret,
    setFretboardSelectedName,
    SLIDER_RIGHT_WINDOW,
    SLIDER_WINDOW_LENGTH,
    STRUM_LOW_TO_HIGH,
} from "../utils";
import { Store } from "./store";

// Types
export interface ProgressionStateType {
    fretboards: FretboardType[];
    leftDiffs: FretboardDiffType[];
    rightDiffs: FretboardDiffType[];
    label: LabelTypes;
    lastUpdated?: string;
}

export interface AppStateType {
    progressions: ProgressionStateType[];
    invert?: boolean;
    leftHand?: boolean;
    status: StatusTypes;
    showTopDrawer: boolean;
    showBottomDrawer: boolean;
    currentProgressionIndex: number;
    strumMode: StrumTypes;
    display: DisplayTypes;
    progress: number;
    rehydrateSuccess: boolean;
    // for fretboard animations
    hiddenFretboardIndex: number;
    // whether the current drag should be turning notes on or off
    fretDragStatus: DragStatusTypes;
    // where the fretboard should scroll to on load/change
    scrollToFret: number;
    scrollToFretUpdated: boolean;
}

export function DEFAULT_MAIN_STATE(): AppStateType {
    return {
        progressions: [DEFAULT_PROGRESSION()],
        invert: false,
        leftHand: false,
        status: HIGHLIGHTED,
        showTopDrawer: false,
        showBottomDrawer: false,
        currentProgressionIndex: 0,
        strumMode: STRUM_LOW_TO_HIGH,
        display: "normal",
        progress: 0.5,
        rehydrateSuccess: false,
        hiddenFretboardIndex: -1,
        fretDragStatus: null,
        scrollToFret: 0,
        scrollToFretUpdated: false,
    };
}

// Helper functions
export function currentProgression(state: AppStateType): ProgressionStateType {
    return state.progressions[state.currentProgressionIndex];
}

export function currentFretboard(state: AppStateType): FretboardType {
    const progression = currentProgression(state);
    return progression.fretboards[Math.floor(state.progress)];
}

export function getComputedAppState(state: AppStateType): AppStateType & {
    progression: ProgressionStateType;
    fretboard: FretboardType;
    visibleFretboards: FretboardType[];
    currentFretboardIndex: number;
    currentVisibleFretboardIndex: number;
    isAnimating: boolean;
} {
    const { progress, hiddenFretboardIndex } = state;
    const progression = currentProgression(state);
    const { fretboards } = progression;
    const currentFretboardIndex = Math.floor(progress);
    const isAnimating = hiddenFretboardIndex >= 0;

    return {
        ...state,
        progression,
        fretboard: currentFretboard(state),
        visibleFretboards: fretboards.filter(
            (_, i) => hiddenFretboardIndex !== i
        ),
        currentFretboardIndex,
        currentVisibleFretboardIndex: isAnimating
            ? hiddenFretboardIndex
            : currentFretboardIndex,
        isAnimating,
    };
}

// Reducers
export const appReducers = {
    clearAll(state: AppStateType) {
        let progression = getComputedAppState(state).progression;
        let { fretboards } = progression;

        const newFretboards = Array(fretboards.length)
            .fill(0)
            .map((_, i) => DEFAULT_FRETBOARD(i));

        return this.setCurrentProgression(
            { ...state, status: SELECTED },
            {
                ...progression,
                ...rebuildDiffs(newFretboards),
            }
        );
    },

    clear(state: AppStateType) {
        let { progression, currentFretboardIndex } = getComputedAppState(state);
        let { fretboards } = progression;

        fretboards[currentFretboardIndex] = DEFAULT_FRETBOARD(
            currentFretboardIndex
        );
        return this.setCurrentProgression(
            { ...state, status: SELECTED },
            {
                ...progression,
                ...rebuildDiffs([...fretboards]),
            }
        );
    },

    clearHighlight(state: AppStateType) {
        let { progression, currentFretboardIndex } = getComputedAppState(state);
        let { fretboards } = progression;

        clearHighlight(fretboards[currentFretboardIndex]);
        return this.setCurrentProgression(state, {
            ...progression,
            ...rebuildDiffs([...fretboards]),
        });
    },

    incrementPosition(state: AppStateType, inc: number, vertical: boolean) {
        let { progression, currentFretboardIndex, scrollToFret } =
            getComputedAppState(state);
        let { fretboards } = progression;

        moveHighight(fretboards[currentFretboardIndex], inc, vertical);
        scrollToFret = getScrollToFret(fretboards[currentFretboardIndex]);

        // TODO: cascadehighlight mode needs this
        // for (let i = 0; i < fretboards.length; i++) {
        //     if (i === currentFretboardIndex) {
        //         moveHighight(fretboards[i], inc, vertical);
        //         scrollToFret = getScrollToFret(fretboards[i]);
        //     } else {
        //         clearHighlight(fretboards[i]);
        //     }
        // }

        return this.setCurrentProgression(
            {
                ...state,
                scrollToFret,
                scrollToFretUpdated: true,
            },
            {
                ...progression,
                ...rebuildDiffs(fretboards),
            }
        );
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

    setHighlightedPosition(state: AppStateType, dir: ArrowTypes) {
        const { invert, leftHand, progression } = getComputedAppState(state);
        const highEBottom = invert === leftHand;

        // Get the action direction based on orientation of fretboard
        // could maybe move this to reducer.
        // highEBottom
        // 	- whether the high E string appears on the top or bottom of the fretboard,
        // 	- depending on invert/leftHand views
        const up = highEBottom ? dir === "ArrowUp" : dir === "ArrowDown";
        const down = highEBottom ? dir === "ArrowDown" : dir === "ArrowUp";
        const right = invert ? dir === "ArrowLeft" : dir === "ArrowRight";
        const left = invert ? dir === "ArrowRight" : dir === "ArrowLeft";

        if (up) return this.incrementPositionY(state);
        if (down) return this.decrementPositionY(state);
        if (right) return this.incrementPositionX(state);
        if (left) return this.decrementPositionX(state);
        return state;
    },

    setHighlightedNote(
        state: AppStateType,
        stringIndex: number,
        fretIndex: number,
        status: StatusTypes
    ) {
        let { progression, currentFretboardIndex } = getComputedAppState(state);
        let { fretboards, label } = progression;

        const oldStatus =
            fretboards[currentFretboardIndex].strings[stringIndex][fretIndex];
        setFret(
            fretboards[currentFretboardIndex],
            stringIndex,
            fretIndex,
            status
        );
        // if fret turned on/off, change the name of the fretboard
        if ((!oldStatus && status) || (oldStatus && !status)) {
            fretboards[currentFretboardIndex].names = getFretboardNames(
                fretboards[currentFretboardIndex],
                label
            );
        }

        // TODO: cascadehighlight mode needs this
        // for (let i = 0; i < fretboards.length; i++) {
        //     if (i === currentFretboardIndex) {
        //         const oldStatus = fretboards[i].strings[stringIndex][fretIndex];
        //         setFret(fretboards[i], stringIndex, fretIndex, status);
        //         // if fret turned on/off, change the name of the fretboard
        //         if ((!oldStatus && status) || (oldStatus && !status)) {
        //             fretboards[i].names = getFretboardNames(
        //                 fretboards[i],
        //                 label
        //             );
        //         }
        //     } else {
        //         clearHighlight(fretboards[i]);
        //     }
        // }

        return this.setCurrentProgression(
            {
                ...state,
            },
            {
                ...progression,
                ...rebuildDiffs(fretboards),
            }
        );
    },

    // not used
    addFretboard(state: AppStateType) {
        let { progression, currentFretboardIndex } = getComputedAppState(state);
        let { fretboards } = progression;

        const lastIndex = fretboards.length - 1;
        fretboards.push(JSON.parse(JSON.stringify(fretboards[lastIndex])));
        currentFretboardIndex = fretboards.length - 1;

        return this.setCurrentProgression(state, {
            ...progression,
            ...cascadeDiffs(fretboards, currentFretboardIndex),
            currentFretboardIndex,
        });
    },

    // not used
    removeFretboard(state: AppStateType) {
        let { progression, currentFretboardIndex } = getComputedAppState(state);
        let { fretboards } = progression;

        if (fretboards.length > 1) fretboards = fretboards.slice(0, -1);
        if (currentFretboardIndex >= fretboards.length)
            currentFretboardIndex = fretboards.length - 1;

        return this.setCurrentProgression(state, {
            ...progression,
            // ...rebuildDiffs(fretboards),
            ...cascadeDiffs(fretboards, currentFretboardIndex),
            currentFretboardIndex,
        });
    },

    setShowTopDrawer(state: AppStateType, showTopDrawer: boolean) {
        const showBottomDrawer = showTopDrawer ? false : state.showBottomDrawer;
        return { ...state, showBottomDrawer, showTopDrawer };
    },

    setShowBottomDrawer(state: AppStateType, showBottomDrawer: boolean) {
        const showTopDrawer = showBottomDrawer ? false : state.showTopDrawer;
        return { ...state, showBottomDrawer, showTopDrawer };
    },

    setDisplay(state: AppStateType, display: DisplayTypes) {
        let showTopDrawer = state.showTopDrawer;
        let showBottomDrawer = state.showBottomDrawer;
        if (display === "normal") {
            showTopDrawer = false;
            showBottomDrawer = false;
        } else if (display === "change-inversion") {
            showTopDrawer = true;
            showBottomDrawer = false;
        } else {
            showTopDrawer = false;
            showBottomDrawer = true;
        }

        return {
            ...state,
            showBottomDrawer,
            showTopDrawer,
            display,
        };
    },

    setStatus(state: AppStateType, status: StatusTypes) {
        return { ...state, status };
    },

    setStrumMode(state: AppStateType, strumMode: StrumTypes) {
        return { ...state, strumMode };
    },

    setLabel(state: AppStateType, label: LabelTypes) {
        const { progression } = getComputedAppState(state);
        const newFretboards = [...progression.fretboards];
        newFretboards.forEach((fretboard) => {
            fretboard.names = getFretboardNames(fretboard, label);
        });

        return this.setCurrentProgression(state, {
            ...progression,
            label,
            fretboards: newFretboards,
        });
    },

    toggleLeftHand(state: AppStateType) {
        const leftHand = !state.leftHand;
        return { ...state, leftHand };
    },

    toggleInvert(state: AppStateType) {
        const invert = !state.invert;
        return { ...state, invert };
    },

    setFretDragStatus(state: AppStateType, fretDragStatus: DragStatusTypes) {
        return { ...state, fretDragStatus };
    },

    setFretboardName(
        state: AppStateType,
        rootIdx: number,
        chordName: string
    ): AppStateType {
        let { fretboard, progression, currentFretboardIndex } =
            getComputedAppState(state);
        let { fretboards } = progression;
        const newFretboard = { ...fretboard };
        setFretboardSelectedName(newFretboard, rootIdx, chordName);
        fretboards[currentFretboardIndex] = newFretboard;
        return this.setCurrentProgression(state, {
            ...progression,
            fretboards,
        });
    },

    setCurrentProgression(
        state: AppStateType,
        progression: ProgressionStateType
    ): AppStateType {
        let { progressions, currentProgressionIndex } = state;
        progressions = [...progressions];
        progressions[currentProgressionIndex] = progression;
        progression.lastUpdated = moment().toISOString();
        return { ...state, progressions };
    },

    // this isn't working
    setProgressionTimestamps(state: AppStateType): AppStateType {
        const progressions = [...state.progressions];
        const currentTime = moment();
        progressions.forEach((progression) => {
            if (!progression.lastUpdated)
                progression.lastUpdated = currentTime.toISOString();
        });
        progressions.sort((a, b) => moment(b.lastUpdated).diff(a.lastUpdated));
        return {
            ...state,
            progressions,
        };
    },

    setCurrentProgressionIndex(
        state: AppStateType,
        currentProgressionIndex: number
    ): AppStateType {
        let { progressions } = state;
        return {
            ...state,
            currentProgressionIndex: Math.min(
                Math.max(currentProgressionIndex, 0),
                progressions.length - 1
            ),
        };
    },

    addProgression(state: AppStateType): AppStateType {
        let { progressions } = state;
        progressions = [...progressions];
        progressions.unshift(DEFAULT_PROGRESSION());
        return {
            ...state,
            progressions,
            currentProgressionIndex: 0,
        };
    },

    removeProgression(state: AppStateType): AppStateType {
        let { currentProgressionIndex, progressions } = state;
        progressions = [...progressions];
        if (progressions.length > 1)
            progressions.splice(currentProgressionIndex, 1);
        return {
            ...state,
            progressions,
            currentProgressionIndex:
                currentProgressionIndex >= progressions.length
                    ? progressions.length - 1
                    : currentProgressionIndex,
        };
    },

    setProgress(state: AppStateType, progress: number): AppStateType {
        // dangerous method, does not return new state object on purpose, use with caution
        const { progression } = getComputedAppState(state);
        state.progress = Math.min(
            Math.max(progress, 0),
            progression.fretboards.length
        );
        return state;
    },

    prepareAnimation(
        state: AppStateType,
        fretboards: FretboardType[],
        startIndex: number
    ): AppStateType {
        const { progression } = getComputedAppState(state);
        return this.setCurrentProgression(
            {
                ...state,
                progress: startIndex + SLIDER_RIGHT_WINDOW,
                hiddenFretboardIndex: startIndex,
            },
            {
                ...progression,
                ...rebuildDiffs(fretboards),
            }
        );
    },

    cleanupAnimation(
        state: AppStateType
        // fretboards: StringSwitchType[],
        // startIndex: number
    ): AppStateType {
        const { progression, hiddenFretboardIndex } =
            getComputedAppState(state);
        let { fretboards } = progression;

        if (hiddenFretboardIndex >= 0) {
            // remove old fretboard, update diffs, reset progress and currentFretboardIndex
            fretboards = [...fretboards];
            fretboards.splice(hiddenFretboardIndex, 1);
            const scrollToFret = getScrollToFret(
                fretboards[hiddenFretboardIndex]
            );
            return this.setCurrentProgression(
                {
                    ...state,
                    progress: hiddenFretboardIndex + 0.5,
                    hiddenFretboardIndex: -1,
                    scrollToFret,
                    scrollToFretUpdated: true,
                },
                {
                    ...progression,
                    ...rebuildDiffs(fretboards),
                }
            );
        } else {
            return state;
        }
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

    currentAnimation: ReturnType<typeof requestAnimationFrame>;

    _fretboardAnimation(fretboardIndex: number, onComplete?: () => void) {
        // this animates the state for other components to listen to,
        // assuming fretboards has been prepared appropriately
        // - set the fretboardIndex as hidden
        // - animate the progress from:
        //   fretboardIndex + SLIDER_RIGHT_WINDOW => fretboardIndex + 1 + SLIDER_LEFT_WINDOW
        // - remove hidden fretboard and call onComplete

        // cancel past animation if pressed quickly
        if (this.currentAnimation) cancelAnimationFrame(this.currentAnimation);

        let nextProgress = fretboardIndex + SLIDER_RIGHT_WINDOW;
        // let startingProgress = nextProgress;

        let frameCount = 0;
        let animationDuration = 0.35; // 0.25 seconds roughly comes out to 15 frames
        let totalFrames = Math.ceil(animationDuration * 60);
        let animationSlideLength = SLIDER_WINDOW_LENGTH;
        let i = 0;

        const performAnimation = () => {
            this.currentAnimation = requestAnimationFrame(performAnimation);

            // increment progress and focused index on each frame
            frameCount++;

            // linear animation
            nextProgress += animationSlideLength / totalFrames;

            // sinusoidal animation
            // nextProgress +=
            //     2 *
            //     (SLIDER_WINDOW_LENGTH / totalFrames) *
            //     Math.sin((Math.PI * frameCount) / totalFrames) ** 2;

            // set progress, and check if we should update fretboardIndex
            this.dispatch.setProgress(nextProgress);

            // when done animating, clear interval, remove extra fretboard, and reset progress
            if (frameCount === totalFrames) {
                cancelAnimationFrame(this.currentAnimation);
                this.dispatch.cleanupAnimation();
                if (onComplete) onComplete();
            }
        };
        requestAnimationFrame(performAnimation);
    }

    chordInputAnimation(
        rootIdx: number,
        chordName: ChordTypes,
        onComplete?: () => void
    ) {
        // animation triggered when changing notes on the current fretboard
        const { progression, currentFretboardIndex, isAnimating } =
            this.getComputedState();
        let { fretboards, label } = progression;

        // don't run animation if already animating
        if (isAnimating) return;

        // create new fretboard from chordName
        const currentFretboard = fretboards[currentFretboardIndex];
        let newFretboard = buildFretboardByChordName(
            rootIdx,
            chordName,
            label,
            currentFretboardIndex
        );
        newFretboard = cascadeDiffs([currentFretboard, newFretboard], 0)
            .fretboards[1];

        fretboards = [...fretboards];
        // add new fretboard to the right of current
        fretboards.splice(currentFretboardIndex + 1, 0, newFretboard);

        this.dispatch.prepareAnimation(fretboards, currentFretboardIndex);
        this._fretboardAnimation(currentFretboardIndex, onComplete);
    }

    switchFretboardAnimation(
        fromIndex: number,
        toIndex: number,
        onComplete?: () => void
    ) {
        // animation triggered when switching between two fretboards
        const { progression, isAnimating } = this.getComputedState();
        let { fretboards } = progression;

        // don't run animation if already animating
        if (isAnimating) return;
        // don't run animation if not switching
        if (fromIndex === toIndex) return;

        // create new fretboard from fromIndex
        let newFretboard = JSON.parse(JSON.stringify(fretboards[fromIndex]));
        // let newFretboard: StringSwitchType = [...fretboards[fromIndex]];

        // add new fretboard to the left of toIndex
        fretboards = [...fretboards];
        fretboards.splice(toIndex, 0, newFretboard);

        this.dispatch.prepareAnimation(fretboards, toIndex);
        this._fretboardAnimation(toIndex, onComplete);
    }
}
