import { useState, useEffect, useRef } from "react";
import {
    FretboardUtil,
    rebuildDiffs,
    SCALE_BUILDER,
    STRING_SIZE,
} from "../utils";
import { Store } from "./store";
import { LabelTypes, DiffType, BrushTypes } from "../types";
import { ActionTypes } from "./actions";

export interface StateType {
    progressions: ProgressionStateType[];
    invert?: boolean;
    leftHand?: boolean;
    stringSize: number;
    brushMode: BrushTypes;
    showInput: boolean;
    currentProgressionIndex: number;
    isDragging: boolean;
    rehydrateSuccess: boolean;
}

export interface ProgressionStateType {
    fretboards: FretboardUtil[];
    leftDiffs: DiffType[];
    rightDiffs: DiffType[];
    focusedIndex: number;
    progress: number;
    scrollToFret: number;
    label: LabelTypes;
}

const fretboards1 = [
    new FretboardUtil(SCALE_BUILDER([0, 2, 5, 8])),
    new FretboardUtil(SCALE_BUILDER([2, 5, 7, 11])),
    new FretboardUtil(SCALE_BUILDER([0, 4, 7, 11])),
];
const fretboards2 = [
    new FretboardUtil(SCALE_BUILDER([0, 2, 5, 8])),
    new FretboardUtil(SCALE_BUILDER([2, 5, 7, 11])),
    new FretboardUtil(SCALE_BUILDER([0, 4, 7, 11])),
];
const fretboards3 = [
    new FretboardUtil(SCALE_BUILDER([0, 2, 5, 8])),
    new FretboardUtil(SCALE_BUILDER([2, 5, 7, 11])),
    new FretboardUtil(SCALE_BUILDER([0, 4, 7, 11])),
];

const progression1: ProgressionStateType = {
    ...rebuildDiffs(fretboards1),
    focusedIndex: 0,
    progress: 0.5,
    scrollToFret: 0,
    label: "flat",
};
const progression2: ProgressionStateType = {
    ...rebuildDiffs(fretboards2),
    focusedIndex: 0,
    progress: 0.5,
    scrollToFret: 0,
    label: "flat",
};
const progression3: ProgressionStateType = {
    ...rebuildDiffs(fretboards3),
    focusedIndex: 0,
    progress: 0.5,
    scrollToFret: 0,
    label: "flat",
};
export function DEFAULT_STATE(): StateType {
    return {
        progressions: [progression1, progression2, progression3],
        invert: false,
        leftHand: false,
        stringSize: STRING_SIZE,
        brushMode: "select",
        showInput: false,
        currentProgressionIndex: 0,
        isDragging: false,
        rehydrateSuccess: false,
    };
}

export function getProgression(state: StateType): ProgressionStateType {
    return state.progressions[state.currentProgressionIndex];
}

export function getFretboards(state: StateType): FretboardUtil[] {
    return getProgression(state).fretboards;
}

export function getFretboard(state: StateType): FretboardUtil {
    return getFretboards(state)[getProgression(state).focusedIndex];
}
