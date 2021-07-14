import { FretboardUtil, rebuildDiffs } from "../utils";
import { LabelTypes, DiffType } from "../types";
import { SCALE_BUILDER, STRING_SIZE } from "../consts";

export interface StateType {
    fretboards: FretboardUtil[];
    leftDiffs: DiffType[];
    rightDiffs: DiffType[];
    label: LabelTypes;
    invert?: boolean;
    leftHand?: boolean;
    stringSize: number;
    focusedIndex: number;
    rehydrateSuccess: boolean;
    progress: number;
}

const fretboards = [
    new FretboardUtil(SCALE_BUILDER([0, 2, 5, 8])),
    new FretboardUtil(SCALE_BUILDER([2, 5, 7, 11])),
    new FretboardUtil(SCALE_BUILDER([0, 4, 7, 11])),
];
export function DEFAULT_STATE(): StateType {
    return {
        ...rebuildDiffs(fretboards),
        label: "flat",
        invert: false,
        leftHand: false,
        stringSize: STRING_SIZE,
        focusedIndex: 0,
        rehydrateSuccess: false,
        progress: 0,
    };
}
