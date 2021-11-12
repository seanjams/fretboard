import {
    DEFAULT_STRINGSWITCH,
    STANDARD_TUNING,
    HIGHLIGHTED,
    SELECTED,
    setFret,
    cascadeDiffs,
} from "../utils";
import {
    StringSwitchType,
    ProgressionStateType,
    StateType,
    SliderStateType,
} from "../types";

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
export function DEFAULT_MAIN_STATE(): StateType {
    return {
        progressions: [progression1, progression2, progression3],
        invert: false,
        leftHand: false,
        status: 1,
        showInput: false,
        currentProgressionIndex: 0,
    };
}

export function DEFAULT_SLIDER_STATE(): SliderStateType {
    return {
        progress: 0.5,
        rehydrateSuccess: false,
    };
}
