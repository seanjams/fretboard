import {
    NoteSwitchType,
    DiffType,
    NoteTypes,
    ChordTypes,
    LabelTypes,
    StringSwitchType,
    StatusTypes,
} from "../types";
import { kCombinations } from "./combinations";
import { isMobile } from "react-device-detect";

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
    SAFETY_AREA_MARGIN,
    FRETBOARD_MARGIN,
} from "../utils";
import { isEqual } from "lodash";

export function stopClick() {
    // can be placed within a mouseup event to prevent
    // the subsequent click event
    window.addEventListener("click", captureClick, true);
    function captureClick(event: MouseEvent | TouchEvent) {
        event.stopPropagation();
        window.removeEventListener("click", captureClick, true);
    }
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
    let minSum = -1;
    let minDiff = {};
    let minDiffScore = -1;
    if (longerList.length === shorterList.length) {
        // return min sum and Diff for best rotation
        const rotatedIndexes = longerList.map(
            (_, i) => (j: number) => (j + i) % longerList.length
        );

        for (let rotation of rotatedIndexes) {
            let diff: DiffType = {};
            let diffScore = 0;
            let absSum = 0;

            for (let i = 0; i < longerList.length; i++) {
                const j = rotation(i);
                const distance = _rotatedDistance(
                    shorterList[j],
                    longerList[i]
                );
                diffScore += distance * distance;
                absSum += Math.abs(distance);
                diff[longerList[i]] = distance;
            }

            const overallMovementIsLess = minSum < 0 || absSum < minSum;
            const lateralMovementIsLess =
                minSum >= 0 && absSum === minSum && diffScore < minDiffScore;

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
            if (minSum < 0 || sum < minSum) {
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

    for (let fromIndex in longToShort) {
        const distance = longToShort[+fromIndex];
        const toIndex = mod(+fromIndex + distance, 12);
        toIndexes.add(toIndex);
        shortToLong[toIndex] = -distance;
    }

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
    const leftDiffs: DiffType[] = [];
    const rightDiffs: DiffType[] = [];

    for (let i = 0; i < fretboards.length; i++) {
        const fretboard = fretboards[i];
        const compareFretboard = fretboards[i + 1];

        let leftDiff: DiffType | null = null;
        let rightDiff: DiffType | null = null;
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
            const status = string[+fretValue];
            const slidesInDiff =
                diffValue !== undefined && Math.abs(diffValue) < 9999;
            if (slidesInDiff) {
                const fretDestinationValue = +fretValue + diffValue;
                setFret(fretboardB, +stringIndex, fretDestinationValue, status);
            }
        }
    }
}

export function mod(a: number, m: number): number {
    return ((a % m) + m) % m;
}

// return array of [1,0,1,0,1,1,0,1,0,1,0] representing notes of fretboard
export function getNotes(fretboard: StringSwitchType): NoteSwitchType {
    const result: NoteSwitchType = DEFAULT_NOTESWITCH();
    for (let string of fretboard) {
        for (let fretValue in string) {
            if (string[fretValue]) result[mod(+fretValue, 12)] = SELECTED;
        }
    }
    return result;
}

export function setFret(
    fretboard: StringSwitchType,
    stringIndex: number,
    fretValue: number,
    status: StatusTypes
): void {
    // set a fret and all corresponding frets on a fretboard
    const noteValue = mod(+fretValue, 12);
    for (let otherString of fretboard) {
        for (let otherFretValue in otherString) {
            // only setFret for frets with matching noteValue
            if (mod(+otherFretValue, 12) !== noteValue) continue;
            // if HIGHLIGHTED (2), only set to SELECTED (1), hence the max
            if (status !== NOT_SELECTED) {
                // if selecting/highlighting a note, go through other notes of matching noteValue,
                // and set them to be at least SELECTED, if not already set higher
                otherString[otherFretValue] = Math.max(
                    otherString[+otherFretValue],
                    SELECTED
                ) as StatusTypes;
            } else {
                otherString[+otherFretValue] = NOT_SELECTED;
            }
        }
    }
    fretboard[mod(+stringIndex, 6)][+fretValue] = status;
}

export function clearHighlight(fretboard: StringSwitchType): void {
    for (let string of fretboard) {
        for (let fretValue in string) {
            if (string[+fretValue] === HIGHLIGHTED)
                string[+fretValue] = SELECTED;
        }
    }
}

export function getNextHighlightedNote(
    value: number,
    scale: number[],
    inc: number
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
    let minStep = 0;

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

export function noteSwitchFromValues(noteValues: number[]): NoteSwitchType {
    let noteSwitch = DEFAULT_NOTESWITCH();
    noteValues.forEach((value) => (noteSwitch[mod(value, 12)] = SELECTED));
    return noteSwitch;
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
    fretboard: StringSwitchType,
    label: LabelTypes
): {
    rootIdx: number;
    rootName: NoteTypes | "";
    chordName: string;
    foundChordName: ChordTypes | "";
}[] {
    const notes = getNotes(fretboard);

    // find chord
    for (let shapeName of Object.keys(SHAPES) as Array<ChordTypes>) {
        // build noteswitch for chord
        const chordShape = noteSwitchFromValues(SHAPES[shapeName]);

        // copy notes
        let tempNotes = notes.map((note) => +!!note); // convert to only 0 or 1

        // rotate through notes and compare to chord to see if matches
        const matchingChordShapes: ReturnType<typeof getName> = [];
        for (let chordNote in chordShape) {
            if (isEqual(tempNotes, chordShape)) {
                matchingChordShapes.push({
                    rootIdx: +chordNote,
                    rootName:
                        label === "sharp"
                            ? SHARP_NAMES[+chordNote]
                            : FLAT_NAMES[+chordNote],
                    chordName: shapeName,
                    foundChordName: shapeName,
                });
            }
            tempNotes = tempNotes.slice(1).concat(tempNotes[0]);
        }

        if (matchingChordShapes.length) {
            return matchingChordShapes;
        }
    }

    // if not found, build comma separated list of note names
    const noteNames: NoteTypes[] = [];
    for (let i in notes) {
        if (notes[i])
            noteNames.push(
                label === "sharp" ? SHARP_NAMES[+i] : FLAT_NAMES[+i]
            );
    }

    return [
        {
            rootIdx: -1,
            rootName: "",
            chordName: noteNames.join(", "),
            foundChordName: "",
        },
    ];
}

export function getScrollToFret(fretboard: StringSwitchType) {
    // look at highlighted frets on fretboard and get median

    const highlightedFrets: number[] = [];

    for (let stringIndex in fretboard) {
        let string = fretboard[stringIndex];
        for (let fretValue in string) {
            if (string[+fretValue] === HIGHLIGHTED) {
                const highlightedFret =
                    +fretValue - STANDARD_TUNING[stringIndex];
                highlightedFrets.push(highlightedFret);
            }
        }
    }

    highlightedFrets.sort((a, b) => a - b);
    const minFret = highlightedFrets[0];
    const maxFret = highlightedFrets[highlightedFrets.length - 1];
    return (maxFret + minFret) / 2;
}

export function moveHighight(
    fretboard: StringSwitchType,
    inc: number,
    vertical: boolean
): boolean {
    const turnOff: [number, number][] = [];
    const turnOn: [number, number][] = [];
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
                newValue = getNextHighlightedNote(
                    +fretValue,
                    scale,
                    verticalIntervalIncrement
                );
                conditions = [
                    newStringIndex < 0,
                    newStringIndex >= fretboard.length,
                    newValue < STANDARD_TUNING[newStringIndex],
                    newValue >= STANDARD_TUNING[newStringIndex] + STRING_SIZE,
                ];
            } else {
                // find new note value, and apply to same string
                newValue = getNextHighlightedNote(+fretValue, scale, inc);
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

            turnOff.push([+stringIndex, +fretValue]);
            turnOn.push([newStringIndex, newValue]);
        }
    }

    if (valid) {
        for (let change of turnOff) {
            setFret(fretboard, change[0], change[1], SELECTED);
        }

        for (let change of turnOn) {
            setFret(fretboard, change[0], change[1], HIGHLIGHTED);
        }
    }

    return valid && !!turnOff.length && !!turnOn.length;
}

export function getNotesByChordName(rootIdx: number, chordName: ChordTypes) {
    let notes = SHAPES[chordName].map((i) => mod(i + rootIdx, 12));
    notes.sort((a, b) => a - b);
    return notes;
}

export function getVisibleFretboards(
    fretboards: StringSwitchType[],
    hiddenFretboardIndices: number[]
): StringSwitchType[] {
    if (hiddenFretboardIndices.length) {
        return fretboards.filter((_, i) => !hiddenFretboardIndices.includes(i));
    }
    return [...fretboards];
}

// Get width of fret at fretIndex with fretboard of given width / string size.
// On guitars, frets get narrower as you climb the fretboard, this mimics that effect.
export function getFretWidth(
    fretboardWidth: number, // width in pixels of entire fretboard
    stringSize: number, // number of frets
    fretIndex: number, // index to calculate width
    severity: number = 0.025 // percentage of how fast fretboard should shrink, from 0-1
): number {
    const severityCoefficient = (fretboardWidth * severity) / stringSize;
    const averageFretWidth = fretboardWidth / stringSize;
    const fretWidthAdjustment = stringSize / 2 - fretIndex;
    return averageFretWidth + fretWidthAdjustment * severityCoefficient;
}

export const getScreenDimensions = (): [number, number] => {
    // hack fix for mobile dimensions
    let width: number;
    let height: number;
    if (isMobile) {
        width = Math.max(screen.width, screen.height);
        height = Math.min(screen.width, screen.height);
    } else {
        width = window.innerWidth;
        height = window.innerHeight;
    }
    return [width, Math.min(height, 420)];
};

export const getFretboardDimensions = () => {
    // -------------------------------
    // Safety Area
    // -------------------------------
    // Gutter
    // -------------------------------
    // Input
    // -------------------------------
    // Fretboard Margin
    // -------------------------------
    // Fretboard Height
    // -------------------------------
    // Fretboard Margin
    // -------------------------------
    // Input
    // -------------------------------
    // Gutter
    // -------------------------------
    // Safety Area
    // -------------------------------

    const GUTTER_PERCENTAGE = 0.22;
    const MAIN_PERCENTAGE = 1 - 2 * GUTTER_PERCENTAGE;
    const INPUT_PERCENTAGE = 0.18;
    const FRETBOARD_PERCENTAGE = MAIN_PERCENTAGE - INPUT_PERCENTAGE;

    const height = getScreenDimensions()[1];
    const gutterHeight = height * GUTTER_PERCENTAGE - SAFETY_AREA_MARGIN;

    const maxInputHeight = height * INPUT_PERCENTAGE;
    const minInputHeight = height * 0;
    const minFretboardHeight =
        height * FRETBOARD_PERCENTAGE - 2 * FRETBOARD_MARGIN;
    const maxFretboardHeight = height * MAIN_PERCENTAGE - 2 * FRETBOARD_MARGIN;

    return {
        gutterHeight,
        minInputHeight,
        maxInputHeight,
        minFretboardHeight,
        maxFretboardHeight,
    };
};
