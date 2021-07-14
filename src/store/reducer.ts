import { ActionTypes } from "./actions";
import { StateType } from "./state";
import { FretboardUtil, rebuildDiffs, cascadeHighlight } from "../utils";

function NeverCalled(never: never): void {}

export function reducer(state: StateType, action: ActionTypes): StateType {
    let { fretboards, focusedIndex } = state;

    if (action.type === "CLEAR") {
        const newFretboards = Array(fretboards.length)
            .fill(0)
            .map(() => new FretboardUtil());
        return {
            ...state,
            ...rebuildDiffs(newFretboards),
        };
    }

    if (action.type === "INVERT") {
        return { ...state, invert: !state.invert };
    }

    if (action.type === "LEFT_HAND") {
        return { ...state, leftHand: !state.leftHand };
    }

    if (action.type === "SET_NOTE") {
        const { note } = action.payload;
        const fretboard = fretboards[focusedIndex].copy();
        fretboard.toggle(note);
        fretboards[focusedIndex] = fretboard;

        return { ...state, ...rebuildDiffs(fretboards) };
    }

    if (action.type === "SET_LABEL") {
        const { label } = action.payload;
        return { ...state, label };
    }

    if (action.type === "INCREMENT_POSITION_X") {
        const fretboard = fretboards[focusedIndex].copy();
        fretboard.incrementPosition(1, false);
        fretboards[focusedIndex] = fretboard;

        const diffs = rebuildDiffs(fretboards);

        // left
        for (let i = focusedIndex; i >= 0; i--) {
            let diff = diffs.leftDiffs[i];
            let fretboardA = fretboards[i];
            let fretboardB = fretboards[i - 1];
            if (!fretboardB) break;
            fretboardB = fretboardB.copy();
            cascadeHighlight(fretboardA, fretboardB, diff);
            fretboards[i - 1] = fretboardB;
        }

        // right
        for (let i = focusedIndex; i < fretboards.length; i++) {
            let diff = diffs.rightDiffs[i];
            let fretboardA = fretboards[i];
            let fretboardB = fretboards[i + 1];
            if (!fretboardB) break;
            fretboardB = fretboardB.copy();
            cascadeHighlight(fretboardA, fretboardB, diff);
            fretboards[i + 1] = fretboardB;
        }

        return {
            ...state,
            ...diffs,
            fretboards,
        };
    }

    if (action.type === "DECREMENT_POSITION_X") {
        const fretboard = fretboards[focusedIndex].copy();
        fretboard.incrementPosition(-1, false);
        fretboards[focusedIndex] = fretboard;

        const diffs = rebuildDiffs(fretboards);

        // left
        for (let i = focusedIndex; i >= 0; i--) {
            let diff = diffs.leftDiffs[i];
            let fretboardA = fretboards[i];
            let fretboardB = fretboards[i - 1];
            if (!fretboardB) break;
            fretboardB = fretboardB.copy();
            cascadeHighlight(fretboardA, fretboardB, diff);
            fretboards[i - 1] = fretboardB;
        }

        // right
        for (let i = focusedIndex; i < fretboards.length; i++) {
            let diff = diffs.rightDiffs[i];
            let fretboardA = fretboards[i];
            let fretboardB = fretboards[i + 1];
            if (!fretboardB) break;
            fretboardB = fretboardB.copy();
            cascadeHighlight(fretboardA, fretboardB, diff);
            fretboards[i + 1] = fretboardB;
        }

        return {
            ...state,
            ...diffs,
            fretboards,
        };
    }

    if (action.type === "INCREMENT_POSITION_Y") {
        const fretboard = fretboards[focusedIndex].copy();
        fretboard.incrementPosition(1, true);
        fretboards[focusedIndex] = fretboard;

        const diffs = rebuildDiffs(fretboards);

        // left
        for (let i = focusedIndex; i >= 0; i--) {
            let diff = diffs.leftDiffs[i];
            let fretboardA = fretboards[i];
            let fretboardB = fretboards[i - 1];
            if (!fretboardB) break;
            fretboardB = fretboardB.copy();
            cascadeHighlight(fretboardA, fretboardB, diff);
            fretboards[i - 1] = fretboardB;
        }

        // right
        for (let i = focusedIndex; i < fretboards.length; i++) {
            let diff = diffs.rightDiffs[i];
            let fretboardA = fretboards[i];
            let fretboardB = fretboards[i + 1];
            if (!fretboardB) break;
            fretboardB = fretboardB.copy();
            cascadeHighlight(fretboardA, fretboardB, diff);
            fretboards[i + 1] = fretboardB;
        }

        return {
            ...state,
            ...diffs,
            fretboards,
        };
    }

    if (action.type === "DECREMENT_POSITION_Y") {
        const fretboard = fretboards[focusedIndex].copy();
        fretboard.incrementPosition(-1, true);
        fretboards[focusedIndex] = fretboard;

        const diffs = rebuildDiffs(fretboards);

        // left
        for (let i = focusedIndex; i >= 0; i--) {
            let diff = diffs.leftDiffs[i];
            let fretboardA = fretboards[i];
            let fretboardB = fretboards[i - 1];
            if (!fretboardB) break;
            fretboardB = fretboardB.copy();
            cascadeHighlight(fretboardA, fretboardB, diff);
            fretboards[i - 1] = fretboardB;
        }

        // right
        for (let i = focusedIndex; i < fretboards.length; i++) {
            let diff = diffs.rightDiffs[i];
            let fretboardA = fretboards[i];
            let fretboardB = fretboards[i + 1];
            if (!fretboardB) break;
            fretboardB = fretboardB.copy();
            cascadeHighlight(fretboardA, fretboardB, diff);
            fretboards[i + 1] = fretboardB;
        }

        return {
            ...state,
            ...diffs,
            fretboards,
        };
    }

    if (action.type === "SET_HIGHLIGHTED_NOTE") {
        const { stringIndex, value } = action.payload;
        const fretboard = fretboards[focusedIndex].copy();
        fretboard.toggleFret(stringIndex, value);
        fretboards[focusedIndex] = fretboard;

        const diffs = rebuildDiffs(fretboards);

        // left
        for (let i = focusedIndex; i >= 0; i--) {
            let diff = diffs.leftDiffs[i];
            let fretboardA = fretboards[i];
            let fretboardB = fretboards[i - 1];
            if (!fretboardB) break;
            fretboardB = fretboardB.copy();
            cascadeHighlight(fretboardA, fretboardB, diff);
            fretboards[i - 1] = fretboardB;
        }

        // right
        for (let i = focusedIndex; i < fretboards.length; i++) {
            let diff = diffs.rightDiffs[i];
            let fretboardA = fretboards[i];
            let fretboardB = fretboards[i + 1];
            if (!fretboardB) break;
            fretboardB = fretboardB.copy();
            cascadeHighlight(fretboardA, fretboardB, diff);
            fretboards[i + 1] = fretboardB;
        }

        return { ...state, ...diffs, fretboards };
    }

    if (action.type === "ADD_FRETBOARD") {
        const lastFretboard = fretboards[fretboards.length - 1].copy();
        fretboards.push(lastFretboard);
        return { ...state, ...rebuildDiffs(fretboards) };
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
        const { fretboardIndex } = action.payload;
        return { ...state, focusedIndex: fretboardIndex };
    }

    if (action.type === "REHYDRATE") {
        return {
            ...action.payload,
        };
    }

    if (action.type === "SAVE_TO_LOCAL_STORAGE") {
        // ignore keys we dont want to pull from localStorage
        const IGNORE = ["rehydrateSuccess"];
        // add in special formatters for keys that were serialized to localStorage
        const HANDLERS: {
            [key in string]: (state: StateType) => any;
        } = {
            fretboards: ({ fretboards }) =>
                fretboards.map((fretboard) => fretboard.toJSON()),
        };

        let key: keyof StateType;
        for (key in state) {
            if (IGNORE.includes(key)) continue;
            let value = JSON.stringify(
                HANDLERS.hasOwnProperty(key) ? HANDLERS[key](state) : state[key]
            );
            localStorage.setItem(key, value);
        }
        return state;
    }

    NeverCalled(action);
}
