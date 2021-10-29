import {
    NoteSwitchType,
    DiffType,
    NoteTypes,
    ChordTypes,
    LabelTypes,
    StringSwitchType,
    numString,
    ProgressionStateType,
    StateType,
} from "../types";
import { kCombinations } from "./combinations";

import {
    SHAPES,
    STRING_SIZE,
    SHARP_NAMES,
    FLAT_NAMES,
    DEFAULT_NOTESWITCH,
    STANDARD_TUNING,
    HIGHLIGHTED,
    SELECTED,
    NOT_SELECTED,
} from "../utils";
import { isEqual } from "lodash";
import {} from "./consts";

export function stopClick() {
    // can be placed within a mouseup event to prevent
    // the subsequent click event
    window.addEventListener("click", captureClick, true);
    function captureClick(e: MouseEvent | TouchEvent) {
        e.stopPropagation();
        window.removeEventListener("click", captureClick, true);
    }
}

export class NoteUtil {
    base: number;
    constructor(base: number) {
        this.base = mod(base, 12);
    }

    getName(label: LabelTypes): NoteTypes {
        if (label === "sharp") {
            return SHARP_NAMES[this.base];
        } else if (label === "flat") {
            return FLAT_NAMES[this.base];
        }
    }
}

export function SCALE_BUILDER(arr: number[]): NoteSwitchType {
    const noteswitch = DEFAULT_NOTESWITCH();
    for (let i of arr) {
        noteswitch[mod(i, 12)] = SELECTED;
    }
    return noteswitch;
}

function _rotatedDistance(a: number, b: number, m: number = 12) {
    let min = a - b;
    if (Math.abs(a - b + m) < Math.abs(min)) min = a - b + m;
    if (Math.abs(a - b - m) < Math.abs(min)) min = a - b - m;
    return min;
}

function _getMinDiff(
    longerList: number[],
    shorterList: number[]
): [number, DiffType] {
    let minSum;
    let minDiff = {};
    let minDiffScore;
    if (longerList.length === shorterList.length) {
        // return min sum and Diff for best rotation
        const rotatedIndexes = longerList.map(
            (_, i) => (j: number) => (j + i) % longerList.length
        );

        for (let rotation of rotatedIndexes) {
            let diff: DiffType = {};
            let diffScore;
            let absSum;

            for (let i = 0; i < longerList.length; i++) {
                const j = rotation(i);
                const distance = _rotatedDistance(
                    shorterList[j],
                    longerList[i]
                );
                if (diffScore === undefined) diffScore = 0;
                if (absSum === undefined) absSum = 0;
                diffScore += distance * distance;
                absSum += Math.abs(distance);
                diff[longerList[i]] = distance;
            }

            const overallMovementIsLess =
                minSum === undefined || absSum < minSum;
            const lateralMovementIsLess =
                minSum !== undefined &&
                absSum === minSum &&
                diffScore < minDiffScore;

            if (overallMovementIsLess || lateralMovementIsLess) {
                minSum = absSum;
                minDiff = diff;
                minDiffScore = diffScore;
            }
        }
    } else {
        // get all combinations of longer list with length of shorter list,
        // and pass back to function to compare in base case above
        const reducedLists = kCombinations(longerList, shorterList.length);
        for (let i = 0; i < reducedLists.length; i++) {
            const reducedList = reducedLists[i];
            const [sum, diff] = _getMinDiff(reducedList, shorterList);
            if (minSum === undefined || sum < minSum) {
                minSum = sum;
                minDiff = diff;
            }
        }
    }

    return [minSum, minDiff];
}

export function compare(
    fretboardA: StringSwitchType,
    fretboardB: StringSwitchType
) {
    // for generating diffs between fretboardA and fretboardB in both directions
    let listA = list(fretboardA);
    let listB = list(fretboardB);

    const listBLonger = listA.length < listB.length;
    let longer = listBLonger ? listB : listA;
    let shorter = listBLonger ? listA : listB;

    const [_, diff] = _getMinDiff(longer, shorter);

    // build both directions
    const longToShort = diff;
    const shortToLong: DiffType = {};
    const toIndexes: Set<number> = new Set();

    Object.keys(longToShort).forEach((fromIndex) => {
        const distance = longToShort[+fromIndex];
        const toIndex = mod(+fromIndex + distance, 12);
        toIndexes.add(toIndex);
        shortToLong[toIndex] = -distance;
    });

    // 9999 = fill
    // -9999 = empty
    for (let index of longer) {
        if (longToShort[+index] === undefined) {
            longToShort[+index] = -9999;
            shortToLong[+index] = 9999;
        }
    }

    for (let index of shorter) {
        if (!toIndexes.has(+index)) {
            longToShort[+index] = 9999;
            shortToLong[+index] = -9999;
        }
    }

    // leftDiff is for the "fretboard on the right" which needs a diff against its left neighor
    // rightDiff is for the "fretboard on the left" which needs a diff against its right neighor
    let leftDiff = listBLonger ? longToShort : shortToLong;
    let rightDiff = listBLonger ? shortToLong : longToShort;
    return [leftDiff, rightDiff];
}

export const rebuildDiffs = (fretboards: StringSwitchType[]) => {
    const leftDiffs = [];
    const rightDiffs = [];

    for (let i = 0; i < fretboards.length; i++) {
        const fretboard = fretboards[i];
        const compareFretboard = fretboards[i + 1];

        let leftDiff;
        let rightDiff;
        if (compareFretboard) {
            [leftDiff, rightDiff] = compare(fretboard, compareFretboard);
        }

        if (rightDiff) rightDiffs[i] = rightDiff;
        if (leftDiff && i + 1 < fretboards.length) leftDiffs[i + 1] = leftDiff;
    }

    return {
        fretboards,
        leftDiffs,
        rightDiffs,
    };
};

export function cascadeDiffs(
    fretboards: StringSwitchType[],
    focusedIndex: number
) {
    fretboards = JSON.parse(JSON.stringify(fretboards));
    const diffs = rebuildDiffs(fretboards);

    // left
    for (let i = focusedIndex; i >= 0; i--) {
        let diff = diffs.leftDiffs[i];
        let fretboardA = fretboards[i];
        let fretboardB = fretboards[i - 1];
        if (!fretboardB) break;
        cascadeHighlight(fretboardA, fretboardB, diff);
    }

    // right
    for (let i = focusedIndex; i < fretboards.length; i++) {
        let diff = diffs.rightDiffs[i];
        let fretboardA = fretboards[i];
        let fretboardB = fretboards[i + 1];
        if (!fretboardB) break;
        cascadeHighlight(fretboardA, fretboardB, diff);
    }

    return { ...diffs, fretboards };
}

// starting at fretboardA, check all strings for any highlighted notes,
// and copy them to corresponding notes on fretboardB via diff
export function cascadeHighlight(
    fretboardA: StringSwitchType,
    fretboardB: StringSwitchType,
    diff: DiffType
) {
    // reset fretboardB's highlighted notes
    clearHighlight(fretboardB);
    for (let stringIndex in fretboardA) {
        const string = fretboardA[stringIndex];
        for (let fretValue in string) {
            const diffValue = diff[mod(+fretValue, 12)];
            const brushMode = string[+fretValue];
            const slidesInDiff =
                diffValue !== undefined && Math.abs(diffValue) < 9999;
            if (slidesInDiff) {
                const fretDestinationValue = +fretValue + diffValue;
                setFret(
                    fretboardB,
                    stringIndex,
                    fretDestinationValue,
                    brushMode
                );
            }
        }
    }
}

export function mod(a: numString, m: number): number {
    return ((+a % m) + m) % m;
}

export function getNotes(fretboard: StringSwitchType): NoteSwitchType {
    const result: NoteSwitchType = DEFAULT_NOTESWITCH();
    fretboard.forEach((string, stringIndex) => {
        Object.keys(string).forEach((fretValue) => {
            if (string[+fretValue]) result[mod(+fretValue, 12)] = SELECTED;
        });
    });
    return result;
}

export function setFret(
    fretboard: StringSwitchType,
    stringIndex: numString,
    fretValue: numString,
    brushMode: number
): void {
    // set a fret and all corresponding frets on a fretboard
    const noteValue = mod(+fretValue, 12);
    fretboard.forEach((otherString, otherStringIndex) => {
        Object.keys(otherString).forEach((otherFretValue) => {
            if (mod(+otherFretValue, 12) !== noteValue) return;
            // if HIGHLIGHTED (2), only set to SELECTED (1), hence the max
            if (brushMode !== NOT_SELECTED) {
                // if selecting/highlighting a note, go through other notes of matching noteValue,
                // and set them to be at least SELECTED, if not already set higher
                otherString[+otherFretValue] = Math.max(
                    otherString[+otherFretValue],
                    SELECTED
                );
            } else {
                otherString[+otherFretValue] = NOT_SELECTED;
            }
        });
    });
    fretboard[mod(+stringIndex, 6)][+fretValue] = brushMode;
}

export function clearHighlight(fretboard: StringSwitchType): void {
    fretboard.forEach((string) => {
        Object.keys(string).forEach((fretValue) => {
            if (string[+fretValue] === HIGHLIGHTED)
                string[+fretValue] = SELECTED;
        });
    });
}

export const rotate = (arr: any[], times: number = 1) => {
    let rotated = [...arr];
    for (let i = 0; i < times; i++) {
        rotated = rotated.slice(1).concat(rotated[0]);
    }

    return rotated;
};

export function getHorizontalIntervalIncrement(
    value: number,
    inc: number,
    scale: number[]
): number {
    if (inc === 0) return value;

    const currentDelta = value - mod(value, 12);
    const currentIndex = scale.indexOf(mod(value, 12));
    if (currentIndex < 0) return value;

    const nextIndex = mod(currentIndex + inc, scale.length);
    const nextDelta = 12 * Math.floor((currentIndex + inc) / scale.length);
    return currentDelta + scale[nextIndex] + nextDelta;
}

export function getVerticalIntervalIncrement(
    scale: number[],
    inc: number
): number {
    let min = 12;
    let minStep: number;

    for (let scaleStep = 1; scaleStep < scale.length; scaleStep++) {
        // get average interval between different scale steps
        let average = 0;
        for (let i = 0; i < scale.length; i++) {
            const interval = mod(
                scale[mod(i + scaleStep, scale.length)] - scale[i],
                12
            );
            average += interval;
        }
        average = Math.abs(average / scale.length);

        // Get distance from most "vertical" possible interval, the perfect 4th
        const averageVerticalDelta = Math.abs(average - 5);
        if (averageVerticalDelta < min) {
            min = averageVerticalDelta;
            minStep = scaleStep;
        }
    }

    return (inc < 0 ? -1 : 1) * minStep;
}

export function noteSwitchToArray(notes: NoteSwitchType): number[] {
    // turns noteswitch into [0,0,1,0,1,0,0...]
    const notesArr: number[] = [];
    Object.keys(notes).forEach((noteIndex) => {
        notesArr[+noteIndex] = Math.min(notes[+noteIndex], SELECTED);
    });
    return notesArr;
}

export function list(fretboard: StringSwitchType): number[] {
    // gets list of indices of notes that are on for current fretboard
    const notes = getNotes(fretboard);
    return Object.keys(notes)
        .filter((i) => notes[+i])
        .map((i) => +i)
        .sort((a, b) => a - b);
}

export function getName(
    notes: NoteSwitchType,
    label: LabelTypes
): [number, string, ChordTypes, string] {
    const chords = Object.keys(SHAPES) as Array<ChordTypes>;
    let rootIdx: number;
    let rootName: NoteTypes;
    let chordName: ChordTypes;
    let chordNotes: string;

    loop1: for (let i = 0; i < chords.length; i++) {
        // copy notes
        let tempNotes = noteSwitchToArray({ ...notes });
        // build noteswitch for chord
        let chordShape = DEFAULT_NOTESWITCH();
        SHAPES[chords[i]].forEach((index) => {
            chordShape[mod(index, 12)] = SELECTED;
        });
        let chordNotes = noteSwitchToArray(chordShape);

        // rotate through notes and compare to chord to see if matches
        for (let j = 0; j < chordNotes.length; j++) {
            if (isEqual(tempNotes, chordNotes)) {
                rootIdx = j;
                chordName = chords[i];
                break loop1;
            } else {
                tempNotes = rotate(tempNotes);
            }
        }
    }

    if (label === "sharp" && rootIdx !== undefined) {
        rootName = SHARP_NAMES[rootIdx];
    } else if (label === "flat" && rootIdx !== undefined) {
        rootName = FLAT_NAMES[rootIdx];
    }

    if (
        rootIdx === undefined &&
        rootName === undefined &&
        chordName === undefined
    ) {
        const chordNoteNames = [];
        for (let i = 0; i < 12; i++) {
            if (notes[i]) {
                let note = new NoteUtil(i);
                chordNoteNames.push(note.getName(label));
            }
        }

        chordNotes = chordNoteNames.join(", ");
    }

    return [rootIdx, rootName, chordName, chordNotes];
}

export function getScrollToFret(fretboard: StringSwitchType) {
    // look at highlighted frets on fretboard and get median

    const highlightedFrets: number[] = [];
    fretboard.forEach((string, stringIndex) => {
        Object.keys(string).forEach((fretValue) => {
            if (string[+fretValue] === HIGHLIGHTED) {
                const highlightedFret =
                    +fretValue - STANDARD_TUNING[stringIndex];
                highlightedFrets.push(highlightedFret);
            }
        });
    });

    highlightedFrets.sort((a, b) => a - b);
    const minFret = highlightedFrets[0];
    const maxFret = highlightedFrets[highlightedFrets.length - 1];
    return (maxFret + minFret) / 2;
}

export function incrementPosition(
    fretboard: StringSwitchType,
    inc: number,
    vertical: boolean
): boolean {
    const turnOff: [numString, numString][] = [];
    const turnOn: [numString, numString][] = [];
    const notes = getNotes(fretboard);

    const scale: number[] = Object.keys(notes)
        .map((key) => +key)
        .filter((key) => notes[key]);
    let verticalIntervalIncrement = vertical
        ? getVerticalIntervalIncrement(scale, inc)
        : 0;

    let valid = true;

    loop1: for (let stringIndex in fretboard) {
        const newStringIndex: number = vertical
            ? +stringIndex + inc
            : +stringIndex;
        for (let fretValue in fretboard[stringIndex]) {
            if (fretboard[stringIndex][fretValue] !== HIGHLIGHTED) continue;
            let newValue: number;
            let conditions: boolean[];
            if (vertical) {
                // get most vertical interval step, find new note value, and apply to next string
                newValue = getHorizontalIntervalIncrement(
                    +fretValue,
                    verticalIntervalIncrement,
                    scale
                );
                conditions = [
                    newStringIndex < 0,
                    newStringIndex >= fretboard.length,
                    newValue < STANDARD_TUNING[newStringIndex],
                    newValue >= STANDARD_TUNING[newStringIndex] + STRING_SIZE,
                ];
            } else {
                // find new note value, and apply to same string
                newValue = getHorizontalIntervalIncrement(
                    +fretValue,
                    inc,
                    scale
                );
                conditions = [
                    newValue === +fretValue,
                    newValue < STANDARD_TUNING[stringIndex],
                    newValue >= STANDARD_TUNING[stringIndex] + STRING_SIZE,
                ];
            }

            if (conditions.some((_) => _)) {
                valid = false;
                break loop1;
            }

            turnOff.push([stringIndex, fretValue]);
            turnOn.push([newStringIndex, newValue]);
        }
    }

    if (valid) {
        for (let change of turnOff) {
            setFret(fretboard, change[0], change[1], NOT_SELECTED);
        }

        for (let change of turnOn) {
            setFret(fretboard, change[0], change[1], HIGHLIGHTED);
        }
    }

    return valid && !!turnOff.length && !!turnOn.length;
}

export function getCurrentProgression(state: StateType): ProgressionStateType {
    return state.progressions[state.currentProgressionIndex];
}

export function getCurrentFretboards(state: StateType): StringSwitchType[] {
    return getCurrentProgression(state).fretboards;
}

export function getCurrentFretboard(state: StateType): StringSwitchType {
    return getCurrentFretboards(state)[
        getCurrentProgression(state).focusedIndex
    ];
}
