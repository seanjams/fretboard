import { ProgressionStateType } from "../store";
import {
    FretboardNameType,
    FretboardType,
    NoteSwitchType,
    StringSwitchType,
} from "../types";
import { NOT_SELECTED, STRING_SIZE } from "./consts";
import { rebuildDiffs } from "./utils";

export function DEFAULT_NOTESWITCH(): NoteSwitchType {
    return [
        NOT_SELECTED,
        NOT_SELECTED,
        NOT_SELECTED,
        NOT_SELECTED,
        NOT_SELECTED,
        NOT_SELECTED,
        NOT_SELECTED,
        NOT_SELECTED,
        NOT_SELECTED,
        NOT_SELECTED,
        NOT_SELECTED,
        NOT_SELECTED,
    ];
}

export function DEFAULT_STRINGSWITCH(): StringSwitchType {
    const fretboard: StringSwitchType = [[], [], [], [], [], []];
    for (let i = 0; i < STRING_SIZE; i++) {
        fretboard[0][i] = NOT_SELECTED;
        fretboard[1][i] = NOT_SELECTED;
        fretboard[2][i] = NOT_SELECTED;
        fretboard[3][i] = NOT_SELECTED;
        fretboard[4][i] = NOT_SELECTED;
        fretboard[5][i] = NOT_SELECTED;
    }
    return fretboard;
}

export function DEFAULT_FRETBOARD_NAME(): FretboardNameType {
    return {
        rootIdx: -1,
        rootName: "",
        chordName: "",
        foundChordName: "",
        isSelected: true,
    };
}

export function DEFAULT_FRETBOARD(colorIndex: number = -1): FretboardType {
    const strings = DEFAULT_STRINGSWITCH();
    const names = [DEFAULT_FRETBOARD_NAME()];
    return {
        strings,
        names,
        currentRootIndex: names[0].rootIdx,
        colorIndex,
    };
}

export function DEFAULT_PROGRESSION(): ProgressionStateType {
    const fretboards = [
        DEFAULT_FRETBOARD(0),
        DEFAULT_FRETBOARD(1),
        DEFAULT_FRETBOARD(2),
        DEFAULT_FRETBOARD(3),
    ];
    return {
        ...rebuildDiffs(fretboards),
        label: "flat",
    };
}

// const label = "flat";

// // Default State
// const fretboards1: FretboardType[] = [
//     buildFretboardByChordName(9, "min__7", label, 0),
//     buildFretboardByChordName(2, "min__7", label, 1),
//     buildFretboardByChordName(7, "7", label, 2),
//     buildFretboardByChordName(0, "maj__7", label, 3),
// ];

// setFret(fretboards1[0], 1, 7, HIGHLIGHTED);
// setFret(fretboards1[0], 2, 7, HIGHLIGHTED);
// setFret(fretboards1[0], 3, 5, HIGHLIGHTED);
// setFret(fretboards1[0], 4, 8, HIGHLIGHTED);

// const progression1: ProgressionStateType = {
//     ...cascadeDiffs(fretboards1, 0),
//     label,
// };
// const progression2: ProgressionStateType = {
//     ...cascadeDiffs(fretboards1, 0),
//     label,
// };
// const progression3: ProgressionStateType = {
//     ...cascadeDiffs(fretboards1, 0),
//     label,
// };
// const progression4: ProgressionStateType = {
//     ...cascadeDiffs(fretboards1, 0),
//     label,
// };

// const PREFILLED_PROGRESSIONS = [
//     progression1,
//     progression2,
//     progression3,
//     progression4,
// ];
