import {
    rebuildDiffs,
    STANDARD_TUNING,
    HIGHLIGHTED,
    DEFAULT_STRINGSWITCH,
    setFret,
} from "../utils";
import { StringSwitchType, ProgressionStateType, StateType } from "../types";

const fretboards1: StringSwitchType[] = [
    DEFAULT_STRINGSWITCH(),
    DEFAULT_STRINGSWITCH(),
    DEFAULT_STRINGSWITCH(),
];

setFret(fretboards1[0], 0, STANDARD_TUNING[0] + 7, HIGHLIGHTED);
setFret(fretboards1[0], 1, STANDARD_TUNING[1] + 7, HIGHLIGHTED);
setFret(fretboards1[0], 2, STANDARD_TUNING[2] + 7, HIGHLIGHTED);
setFret(fretboards1[0], 3, STANDARD_TUNING[3] + 7, HIGHLIGHTED);
setFret(fretboards1[0], 4, STANDARD_TUNING[4] + 7, HIGHLIGHTED);
setFret(fretboards1[0], 5, STANDARD_TUNING[5] + 7, HIGHLIGHTED);

setFret(fretboards1[1], 0, STANDARD_TUNING[0] + 5, HIGHLIGHTED);
setFret(fretboards1[1], 1, STANDARD_TUNING[1] + 7, HIGHLIGHTED);
setFret(fretboards1[1], 2, STANDARD_TUNING[2] + 5, HIGHLIGHTED);
setFret(fretboards1[1], 3, STANDARD_TUNING[3] + 6, HIGHLIGHTED);
setFret(fretboards1[1], 4, STANDARD_TUNING[4] + 5, HIGHLIGHTED);
setFret(fretboards1[1], 5, STANDARD_TUNING[5] + 5, HIGHLIGHTED);

setFret(fretboards1[2], 0, STANDARD_TUNING[0] + 5, HIGHLIGHTED);
setFret(fretboards1[2], 1, STANDARD_TUNING[1] + 5, HIGHLIGHTED);
setFret(fretboards1[2], 2, STANDARD_TUNING[2] + 7, HIGHLIGHTED);
setFret(fretboards1[2], 3, STANDARD_TUNING[3] + 6, HIGHLIGHTED);
setFret(fretboards1[2], 4, STANDARD_TUNING[4] + 7, HIGHLIGHTED);
setFret(fretboards1[2], 5, STANDARD_TUNING[5] + 5, HIGHLIGHTED);

const progression1: ProgressionStateType = {
    ...rebuildDiffs(fretboards1),
    focusedIndex: 0,
    scrollToFret: 0,
    label: "flat",
    hiddenFretboardIndices: [],
};
const progression2: ProgressionStateType = {
    ...rebuildDiffs(fretboards1),
    focusedIndex: 0,
    scrollToFret: 0,
    label: "flat",
    hiddenFretboardIndices: [],
};
const progression3: ProgressionStateType = {
    ...rebuildDiffs(fretboards1),
    focusedIndex: 0,
    scrollToFret: 0,
    label: "flat",
    hiddenFretboardIndices: [],
};
export function DEFAULT_STATE(): StateType {
    return {
        progressions: [progression1, progression2, progression3],
        invert: false,
        leftHand: false,
        brushMode: 1,
        showInput: false,
        currentProgressionIndex: 0,
    };
}
