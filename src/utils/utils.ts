import {
    ChordTypes,
    DiffType,
    FretboardNameType,
    LabelTypes,
    NoteSwitchType,
    NoteTypes,
    StatusTypes,
    FretboardType,
    WindowMouseEvent,
    FretboardDiffType,
} from "../types";
import { kCombinations } from "./combinations";
import { isMobile } from "react-device-detect";

import {
    DEFAULT_FRETBOARD,
    DEFAULT_FRETBOARD_NAME,
    DEFAULT_NOTESWITCH,
    FLAT_NAMES,
    HIGHLIGHTED,
    NOT_SELECTED,
    SAFETY_AREA_MARGIN,
    SELECTED,
    SHAPES,
    SHARP_NAMES,
    STANDARD_TUNING,
    STRING_SIZE,
} from "../utils";
import { isEqual } from "lodash";

export function stopClick() {
    // can be placed within a mouseup event to prevent
    // the subsequent click event
    window.addEventListener("click", captureClick, true);
    function captureClick(event: WindowMouseEvent) {
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

export function diffToFretboardDiff(
    diff: DiffType,
    fretboardA: FretboardType,
    fretboardB: FretboardType
): FretboardDiffType {
    // converts normalized diff to fretboard diff
    const fretboardDiff: FretboardDiffType = [{}, {}, {}, {}, {}, {}];
    for (let stringIndex in fretboardA.strings) {
        const fretString = fretboardA.strings[+stringIndex];
        for (let fretIndex in fretString) {
            const currentStatus = fretboardA.strings[+stringIndex][+fretIndex];
            const destinationStatus =
                fretboardB.strings[+stringIndex][+fretIndex];
            const fretValue = getFretValue(+stringIndex, +fretIndex, true);

            if (diff[fretValue] !== undefined) {
                if (
                    diff[fretValue] === 9999 &&
                    destinationStatus === HIGHLIGHTED
                )
                    fretboardDiff[+stringIndex][+fretIndex] = 10000;
                if (diff[fretValue] === -9999 && currentStatus === HIGHLIGHTED)
                    fretboardDiff[+stringIndex][+fretIndex] = -10000;
                fretboardDiff[+stringIndex][+fretIndex] = diff[fretValue];
            }
        }
    }

    return fretboardDiff;
}

export function compare(fretboardA: FretboardType, fretboardB: FretboardType) {
    // for generating diffs between stringsA and stringsB in both directions
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

export const rebuildDiffs = (fretboards: FretboardType[]) => {
    const leftDiffs: FretboardDiffType[] = [];
    const rightDiffs: FretboardDiffType[] = [];

    for (let i = 0; i < fretboards.length; i++) {
        const fretboard = fretboards[i];
        const compareFretboard = fretboards[i + 1];

        let leftDiff: DiffType | null = null;
        let rightDiff: DiffType | null = null;
        let leftFretboardDiff: FretboardDiffType | null = null;
        let rightFretboardDiff: FretboardDiffType | null = null;
        if (compareFretboard) {
            [leftDiff, rightDiff] = compare(fretboard, compareFretboard);
            leftFretboardDiff = diffToFretboardDiff(
                leftDiff,
                compareFretboard,
                fretboard
            );
            rightFretboardDiff = diffToFretboardDiff(
                rightDiff,
                fretboard,
                compareFretboard
            );
        }

        if (rightFretboardDiff) rightDiffs[i] = rightFretboardDiff;
        if (leftFretboardDiff && i + 1 < fretboards.length)
            leftDiffs[i + 1] = leftFretboardDiff;
    }

    return {
        fretboards,
        leftDiffs,
        rightDiffs,
    };
};

export function cascadeDiffs(
    fretboards: FretboardType[],
    currentFretboardIndex: number
) {
    fretboards = JSON.parse(JSON.stringify(fretboards));
    const diffs = rebuildDiffs(fretboards);

    // left
    for (let i = currentFretboardIndex; i >= 0; i--) {
        let diff = diffs.leftDiffs[i];
        let fretboardA = fretboards[i];
        let fretboardB = fretboards[i - 1];
        if (!fretboardB) break;
        cascadeHighlight(fretboardA, fretboardB, diff);
    }

    // right
    for (let i = currentFretboardIndex; i < fretboards.length; i++) {
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
    fretboardA: FretboardType,
    fretboardB: FretboardType,
    diff: FretboardDiffType
) {
    // reset fretboardB's highlighted notes
    clearHighlight(fretboardB);
    for (let stringIndex in fretboardA.strings) {
        const fretString = fretboardA.strings[stringIndex];
        for (let fretIndex in fretString) {
            // TODO: cascadehighlight mode needs this
            // const diffValue = diff[getFretValue(+stringIndex, +fretIndex)];
            const diffValue = diff[+stringIndex][+fretIndex];
            const status = fretString[fretIndex];
            const slidesInDiff =
                diffValue !== undefined && Math.abs(diffValue) < 9999;
            if (slidesInDiff) {
                const fretDestinationIndex = +fretIndex + diffValue;
                setFret(fretboardB, +stringIndex, fretDestinationIndex, status);
            }
        }
    }
}

export function mod(a: number, m: number): number {
    return ((a % m) + m) % m;
}

// return array of [1,0,1,0,1,1,0,1,0,1,0] representing notes of fretboard
export function getFretboardNotes(fretboard: FretboardType): NoteSwitchType {
    const result: NoteSwitchType = DEFAULT_NOTESWITCH();
    for (let stringIndex in fretboard.strings) {
        const fretString = fretboard.strings[stringIndex];
        for (let fretIndex in fretString) {
            if (fretString[fretIndex])
                result[getFretValue(+stringIndex, +fretIndex)] = SELECTED;
        }
    }
    return result;
}

export function getFretValue(
    stringIndex: number,
    fretIndex: number,
    normalize = true
) {
    const fretValue = fretIndex + STANDARD_TUNING[stringIndex];
    return normalize ? mod(fretValue, 12) : fretValue;
}

export function setFret(
    fretboard: FretboardType,
    stringIndex: number,
    fretIndex: number,
    status: StatusTypes
): void {
    // set a fret and all corresponding frets on a fretboard
    const fretValue = getFretValue(stringIndex, fretIndex);
    for (let otherStringIndex in fretboard.strings) {
        let otherString = fretboard.strings[otherStringIndex];
        for (let otherFretIndex in otherString) {
            let otherFretValue = getFretValue(
                +otherStringIndex,
                +otherFretIndex
            );
            // only setFret for frets with matching fretValue
            if (otherFretValue !== fretValue) continue;
            // if HIGHLIGHTED (2), only set to SELECTED (1), hence the max
            if (status !== NOT_SELECTED) {
                // if selecting/highlighting a note, go through other notes of matching fretValue,
                // and set them to be at least SELECTED, if not already set higher
                otherString[otherFretIndex] = Math.max(
                    otherString[otherFretIndex],
                    SELECTED
                ) as StatusTypes;
            } else {
                otherString[otherFretIndex] = NOT_SELECTED;
            }
        }
    }

    fretboard.strings[stringIndex][fretIndex] = status;
}

export function clearHighlight(fretboard: FretboardType): void {
    for (let string of fretboard.strings) {
        for (let fretValue in string) {
            if (string[+fretValue] === HIGHLIGHTED)
                string[+fretValue] = SELECTED;
        }
    }
}

export function getNextHighlightedFretIndex(
    stringIndex: number,
    fretIndex: number,
    scale: number[],
    stringIncrement: number,
    intervalIncrement: number
): [number, number] {
    let newStringIndex = stringIndex;
    let newFretIndex = fretIndex;
    if (intervalIncrement === 0) return [newStringIndex, newFretIndex];

    const value = getFretValue(stringIndex, fretIndex, false);
    const currentDelta = value - mod(value, 12);
    const currentIndex = scale.indexOf(mod(value, 12));
    if (currentIndex < 0) return [newStringIndex, newFretIndex];
    const nextIndex = mod(currentIndex + intervalIncrement, scale.length);
    const nextDelta =
        12 * Math.floor((currentIndex + intervalIncrement) / scale.length);
    const nextValue = currentDelta + scale[nextIndex] + nextDelta;
    newStringIndex = stringIndex + stringIncrement;
    newFretIndex = nextValue - STANDARD_TUNING[newStringIndex];
    return [newStringIndex, newFretIndex];
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

export function list(fretboard: FretboardType): number[] {
    // gets list of indices of notes that are on for current fretboard
    const notes = getFretboardNotes(fretboard);
    return Object.keys(notes)
        .filter((i) => notes[+i])
        .map((i) => +i)
        .sort((a, b) => a - b);
}

export function getFretboardNames(
    fretboard: FretboardType,
    label: LabelTypes = "flat"
): FretboardNameType[] {
    const notes = getFretboardNotes(fretboard);
    const matchingChordNames: [FretboardNameType, number][] = [];

    // find chord
    for (let shapeOptions of SHAPES) {
        // build noteswitch for chord
        const shapeName = shapeOptions.label;
        for (let i = 0; i < shapeOptions.shapes.length; i++) {
            const chordShape = noteSwitchFromValues(shapeOptions.shapes[i]);
            const priority = i;

            // copy notes
            let tempNotes = notes.map((note) => +!!note); // convert to only 0 or 1

            // rotate through notes and compare to chord to see if matches
            for (let rootIdx in chordShape) {
                if (isEqual(tempNotes, chordShape)) {
                    matchingChordNames.push([
                        {
                            rootIdx: +rootIdx,
                            rootName:
                                label === "sharp"
                                    ? SHARP_NAMES[+rootIdx]
                                    : FLAT_NAMES[+rootIdx],
                            chordName: shapeName,
                            foundChordName: shapeName,
                            isSelected: +rootIdx === fretboard.currentRootIndex,
                        },
                        priority,
                    ]);
                }
                tempNotes = tempNotes.slice(1).concat(tempNotes[0]);
            }
        }
    }

    // sort by priority
    matchingChordNames.sort((a, b) => a[1] - b[1]);

    if (matchingChordNames.length) {
        const matches = matchingChordNames.map((match) => match[0]);
        if (!matches.some((name) => name.isSelected))
            matches[0].isSelected = true;
        return matches;
    }

    // if not found, build comma separated list of note names
    const noteNames: NoteTypes[] = [];
    for (let i in notes) {
        if (notes[i])
            noteNames.push(
                label === "sharp" ? SHARP_NAMES[+i] : FLAT_NAMES[+i]
            );
    }

    const notFoundName = DEFAULT_FRETBOARD_NAME();
    notFoundName.chordName = noteNames.join(", ");
    return [notFoundName];
}

export function getScrollToFret(fretboard: FretboardType) {
    // look at highlighted frets on fretboard and get median

    const highlightedFrets: number[] = [];

    for (let fretString of fretboard.strings) {
        for (let fretIndex in fretString) {
            if (fretString[fretIndex] === HIGHLIGHTED) {
                const highlightedFret = +fretIndex;
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
    fretboard: FretboardType,
    inc: number,
    vertical: boolean
): boolean {
    const turnOff: [number, number][] = [];
    const turnOn: [number, number][] = [];
    const notes = getFretboardNotes(fretboard);

    const scale: number[] = Object.keys(notes)
        .map((key) => +key)
        .filter((key) => notes[key]);
    let verticalStringIncrement = vertical ? inc : 0;
    let verticalIntervalIncrement = vertical
        ? getVerticalIntervalIncrement(scale, inc)
        : 0;

    let valid = true;

    loop1: for (let stringIndex in fretboard.strings) {
        let fretString = fretboard.strings[stringIndex];
        for (let fretIndex in fretString) {
            if (fretString[fretIndex] !== HIGHLIGHTED) continue;
            let newStringIndex: number;
            let newFretIndex: number;
            let conditions: boolean[];
            if (vertical) {
                // get most vertical interval step, find new note value, and apply to next string
                [newStringIndex, newFretIndex] = getNextHighlightedFretIndex(
                    +stringIndex,
                    +fretIndex,
                    scale,
                    verticalStringIncrement,
                    verticalIntervalIncrement
                );
                conditions = [
                    newStringIndex < 0,
                    newStringIndex >= fretboard.strings.length,
                    newFretIndex < 0,
                    newFretIndex >= STRING_SIZE,
                ];
            } else {
                // find new note value, and apply to same string
                [newStringIndex, newFretIndex] = getNextHighlightedFretIndex(
                    +stringIndex,
                    +fretIndex,
                    scale,
                    0,
                    inc
                );
                conditions = [
                    newFretIndex === +fretIndex,
                    newFretIndex < 0,
                    newFretIndex >= STRING_SIZE,
                ];
            }

            if (conditions.some((_) => _)) {
                valid = false;
                break loop1;
            }

            turnOff.push([+stringIndex, +fretIndex]);
            turnOn.push([newStringIndex, newFretIndex]);
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
    const shapeOptions = SHAPES.find((shape) => shape.label === chordName);
    if (!shapeOptions) return [];
    let notes = shapeOptions.shapes[0].map((i) => mod(i + rootIdx, 12));
    notes.sort((a, b) => a - b);
    return notes;
}

export function getVisibleFretboards(
    fretboards: FretboardType[],
    hiddenFretboardIndex: number
): FretboardType[] {
    if (hiddenFretboardIndex >= 0) {
        return fretboards.filter((_, i) => i !== hiddenFretboardIndex);
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
    // Top Drawer (starts at 0 height)
    // -------------------------------
    // Fretboard Margin
    // -------------------------------
    // Fretboard Height
    // -------------------------------
    // Fretboard Margin
    // -------------------------------
    // Bottom Drawer (starts at 0 height)
    // -------------------------------
    // Gutter
    // -------------------------------
    // Safety Area
    // -------------------------------

    const GUTTER_PERCENTAGE = 0.23;
    const MAIN_PERCENTAGE = 1 - 2 * GUTTER_PERCENTAGE;
    const INPUT_PERCENTAGE = 0.2;
    const FRETBOARD_PERCENTAGE = MAIN_PERCENTAGE - INPUT_PERCENTAGE;

    const height = getScreenDimensions()[1];
    const gutterHeight = height * GUTTER_PERCENTAGE - SAFETY_AREA_MARGIN;

    const maxInputHeight = height * INPUT_PERCENTAGE;
    const minInputHeight = height * 0;
    const minFretboardHeight = height * FRETBOARD_PERCENTAGE;
    const maxFretboardHeight = height * MAIN_PERCENTAGE;

    // one sixth of x% of fretboard height, for some extra padding
    const circleSize = Math.floor((maxFretboardHeight * 0.72) / 6);

    return {
        gutterHeight,
        minInputHeight,
        maxInputHeight,
        minFretboardHeight,
        maxFretboardHeight,
        circleSize,
    };
};

export function updateIfChanged(
    oldState: { [key in string]: any },
    newState: { [key in string]: any },
    fields: string[],
    cb: () => any
) {
    for (let field of fields) {
        if (
            oldState.hasOwnProperty(field) &&
            newState.hasOwnProperty(field) &&
            oldState[field] !== newState[field]
        ) {
            cb();
            return;
        }
    }
}

export function setFretboardSelectedName(
    fretboard: FretboardType,
    rootIdx: number,
    chordName: string
) {
    fretboard.names.forEach((name) => {
        name.isSelected = name.rootIdx === rootIdx;
        if (chordName)
            name.isSelected = name.isSelected && name.chordName === chordName;
        if (name.isSelected) fretboard.currentRootIndex = name.rootIdx;
    });
    if (!fretboard.names.filter((name) => name.isSelected)[0]) {
        fretboard.names[0].isSelected = true;
        fretboard.currentRootIndex = fretboard.names[0].rootIdx;
    }
}

export function buildFretboardByChordName(
    rootIdx: number,
    chordName: ChordTypes,
    label: LabelTypes,
    colorIndex: number
) {
    // create new fretboard from notes, set all on E string arbitrarily
    const notes = getNotesByChordName(rootIdx, chordName);
    let newFretboard = DEFAULT_FRETBOARD();
    const EStringOffset = mod(STANDARD_TUNING[0], 12);
    for (let i = 0; i < notes.length; i++) {
        const fretValue = notes[i];
        const fretIndex = mod(12 - EStringOffset + fretValue, 12);
        setFret(newFretboard, 0, fretIndex, SELECTED);
    }
    newFretboard.names = getFretboardNames(newFretboard, label);
    setFretboardSelectedName(newFretboard, rootIdx, chordName);
    newFretboard.colorIndex = colorIndex;
    return newFretboard;
}
