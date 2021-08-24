import {
    SHARP_NAMES,
    FLAT_NAMES,
    DEFAULT_NOTESWITCH,
    DEFAULT_STRINGSWITCH,
    STANDARD_TUNING,
    STRING_SIZE,
    SHAPES,
} from "./consts";
import {
    NoteTypes,
    LabelTypes,
    NoteSwitchType,
    StringSwitchType,
    numString,
    KeyControlTypes,
    DiffType,
    ChordTypes,
} from "../types";
import { kCombinations } from "./combinations";
import { isEqual, result } from "lodash";

export function copy(obj: any): any {
    return JSON.parse(JSON.stringify(obj));
}

export function mod(a: numString, m: number): number {
    return ((+a % m) + m) % m;
}

export const getNotes = (noteIndices: number[]) => {
    const notes = Array<boolean>(12).fill(false);
    noteIndices.forEach((index) => {
        index = mod(index, 12);
        notes[index] = true;
    });
    return notes;
};

export const rotate = (arr: any[], times: number = 1) => {
    let rotated = copy(arr);
    for (let i = 0; i < times; i++) {
        rotated = rotated.slice(1).concat(rotated[0]);
    }

    return rotated;
};

export function stopClick() {
    // can be placed within a mouseup event to prevent
    // the subsequent click event
    window.addEventListener("click", captureClick, true);
    function captureClick(e: MouseEvent | TouchEvent) {
        e.stopPropagation();
        window.removeEventListener("click", captureClick, true);
    }
}

export function getPositionActionType(
    invert: boolean,
    leftHand: boolean,
    direction: string
): KeyControlTypes | null {
    // Get the action direction based on orientation of fretboard
    // could maybe move this to reducer.
    // highEBottom
    // 	- whether the high E string appears on the top or bottom of the fretboard,
    // 	- depending on invert/leftHand views
    const highEBottom = invert !== leftHand;
    const keyMap: { [key: string]: KeyControlTypes } = {
        ArrowUp: highEBottom ? "DECREMENT_POSITION_Y" : "INCREMENT_POSITION_Y",
        ArrowDown: highEBottom
            ? "INCREMENT_POSITION_Y"
            : "DECREMENT_POSITION_Y",
        ArrowRight: invert ? "DECREMENT_POSITION_X" : "INCREMENT_POSITION_X",
        ArrowLeft: invert ? "INCREMENT_POSITION_X" : "DECREMENT_POSITION_X",
    };

    return keyMap[direction];
}

// export function shuffleArray(array: any[]): void {
//     for (let i = array.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [array[i], array[j]] = [array[j], array[i]];
//     }
// }

export const COLORS = [
    ["#C1BFB5", "#B02E0C"],
    // ["#DBB3B1", "#6C534E"],
    // ["#F2E3BC", "#618985"],
    // ["#BBDFC5", "#14342B"],
    // ["#CEDFD9", "#9B6A6C"],
    // ["#E5D4ED", "#5941A9"],
    // ["#D7BEA8", "#744253"],
    // ["#CAD2C5", "#52489C"],
];
// shuffleArray(COLORS);

export function SCALE_BUILDER(arr: number[]): NoteSwitchType {
    const noteswitch = { ...DEFAULT_NOTESWITCH };
    for (let i of arr) {
        noteswitch[mod(i, 12)] = true;
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

export function compare(fretboardA: FretboardUtil, fretboardB: FretboardUtil) {
    // for generating diffs between fretboardA and fretboardB in both directions

    let listA = fretboardA.list();
    let listB = fretboardB.list();
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

export interface FretboardUtilType {
    notes: NoteSwitchType;
    strings: StringSwitchType;
    rootIdx?: number;
    chordName?: ChordTypes;
    visible?: boolean;
}

export class FretboardUtil implements FretboardUtilType {
    notes: NoteSwitchType;
    strings: StringSwitchType;
    rootIdx?: number;
    chordName?: ChordTypes;
    visible?: boolean;

    constructor(
        notes: NoteSwitchType | null = { ...DEFAULT_NOTESWITCH },
        strings: StringSwitchType | null = { ...DEFAULT_STRINGSWITCH },
        rootIdx: number | null = null,
        chordName: ChordTypes | null = null,
        visible: boolean = true
    ) {
        this.notes = notes;
        this.strings = strings;
        this.visible = visible;
        if (rootIdx !== null) this.rootIdx = rootIdx;
        if (chordName !== null) this.chordName = chordName;
        if (
            !rootIdx &&
            !chordName &&
            Object.values(this.notes).some((val) => val)
        )
            this.setName("flat");
    }

    // gets whether index of note is "on" or "off" in this fretboard
    get(index: numString): boolean {
        return !!this.notes[mod(+index, 12)];
    }

    // sets whether index of note is "on" or "off" in this fretboard
    set(index: numString, active: boolean): boolean {
        if (!active) this.clearFrets(mod(+index, 12));
        return (this.notes[mod(+index, 12)] = active);
    }

    // toggles whether index of note is "on" or "off" in this fretboard
    toggle(index: number): boolean {
        return this.set(index, !this.get(index));
    }

    // gets whether stringIndex at fretValue is highlighted or not for this fretboard
    getFret(stringIndex: numString, fretValue: numString): boolean {
        return !!this.strings[mod(+stringIndex, 6)][+fretValue];
    }

    // sets whether stringIndex at fretValue is highlighted or not for this fretboard
    setFret(
        stringIndex: numString,
        fretValue: numString,
        active: boolean
    ): boolean {
        if (active) this.set(fretValue, active);
        return (this.strings[mod(+stringIndex, 6)][+fretValue] = active);
    }

    // toggles whether stringIndex at fretValue is highlighted or not for this fretboard
    toggleFret(stringIndex: number, fretValue: number): boolean {
        return this.setFret(
            stringIndex,
            fretValue,
            !this.getFret(stringIndex, fretValue)
        );
    }

    clearFrets(index: number): void {
        for (let i in this.strings) {
            for (let j in this.strings[i]) {
                if (this.getFret(i, j) && mod(j, 12) == index) {
                    this.setFret(i, j, false);
                }
            }
        }
    }

    list(): number[] {
        const result: number[] = [];
        Object.keys(this.notes).forEach((note, i) => {
            if (this.notes[+note]) {
                result.push(i);
            }
        });
        return result;
    }

    listString(stringIndex: number): number[] {
        return Object.keys(this.strings[mod(stringIndex, 6)])
            .map((key) => +key)
            .sort((a: number, b: number) => a - b);
    }

    _getIncrement(value: number, inc: number, scale: number[]): number {
        if (inc === 0) return value;

        const currentDelta = value - mod(value, 12);
        const currentIndex = scale.indexOf(mod(value, 12));
        if (currentIndex < 0) return value;

        const nextIndex = mod(currentIndex + inc, scale.length);
        const nextDelta = 12 * Math.floor((currentIndex + inc) / scale.length);
        return currentDelta + scale[nextIndex] + nextDelta;
    }

    _getVerticalIntervalIncrement(scale: number[], inc: number): number {
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

    incrementPosition(inc: number, vertical: boolean): boolean {
        const turnOff: [numString, numString][] = [];
        const turnOn: [numString, numString][] = [];

        const scale: number[] = Object.keys(this.notes)
            .map((key) => +key)
            .filter((key) => this.notes[key]);
        let verticalIntervalIncrement = vertical
            ? this._getVerticalIntervalIncrement(scale, inc)
            : 0;

        let valid = true;

        loop1: for (let stringIndex in this.strings) {
            const newStringIndex: number = vertical
                ? +stringIndex + inc
                : +stringIndex;
            for (let fretValue in this.strings[stringIndex]) {
                if (!this.getFret(stringIndex, fretValue)) continue;
                let newValue: number;
                let conditions: boolean[];
                if (vertical) {
                    // get most vertical interval step, find new note value, and apply to next string
                    newValue = this._getIncrement(
                        +fretValue,
                        verticalIntervalIncrement,
                        scale
                    );
                    conditions = [
                        newStringIndex < 0,
                        newStringIndex >= this.strings.length,
                        newValue < STANDARD_TUNING[newStringIndex],
                        newValue >=
                            STANDARD_TUNING[newStringIndex] + STRING_SIZE,
                    ];
                } else {
                    // find new note value, and apply to same string
                    newValue = this._getIncrement(+fretValue, inc, scale);
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
                this.setFret(change[0], change[1], false);
            }

            for (let change of turnOn) {
                this.setFret(change[0], change[1], true);
            }
        }

        return valid && !!turnOff.length && !!turnOn.length;
    }

    getScrollToFret() {
        // look at highlighted frets on fretboard and get median
        const highlightedFrets = [];
        for (let stringIndex in this.strings) {
            for (let fretValue in this.strings[stringIndex]) {
                if (this.strings[stringIndex][fretValue]) {
                    const highlightedFret =
                        +fretValue - STANDARD_TUNING[stringIndex];
                    highlightedFrets.push(highlightedFret);
                }
            }
        }

        highlightedFrets.sort();
        const minFret = highlightedFrets[0];
        const maxFret = highlightedFrets[highlightedFrets.length - 1];
        return (maxFret + minFret) / 2;
    }

    setName(label: LabelTypes) {
        const chords = Object.keys(SHAPES) as Array<ChordTypes>;
        let rootIdx;
        let rootName: NoteTypes;
        let chordName: ChordTypes;

        loop1: for (let i = 0; i < chords.length; i++) {
            let chordShape = getNotes(SHAPES[chords[i]]);
            let temp = Array(12)
                .fill(false)
                .map((_, i) => this.notes[i]);
            for (let j = 0; j < chordShape.length; j++) {
                if (isEqual(temp, chordShape)) {
                    rootIdx = j;
                    chordName = chords[i];
                    break loop1;
                } else {
                    temp = rotate(temp);
                }
            }
        }

        this.rootIdx = rootIdx;
        this.chordName = chordName;

        return this.getName(label);
    }

    getName(label: LabelTypes) {
        if (
            typeof this.rootIdx === "undefined" ||
            typeof this.chordName === "undefined"
        ) {
            const result = [];
            for (let i = 0; i < 12; i++) {
                if (this.notes[i]) {
                    let note = new NoteUtil(i);
                    result.push(note.getName(label));
                }
            }
            return result.join(", ");
        }

        let rootName;
        if (label === "sharp") {
            rootName = SHARP_NAMES[this.rootIdx];
        } else if (label === "flat") {
            rootName = FLAT_NAMES[this.rootIdx];
        }

        return `${rootName}~~${this.chordName}`;
    }

    copy(): FretboardUtil {
        return new FretboardUtil(
            copy(this.notes),
            copy(this.strings),
            this.rootIdx,
            this.chordName,
            this.visible
        );
    }

    toJSON(): FretboardUtilType {
        return {
            notes: copy(this.notes),
            strings: copy(this.strings),
            rootIdx: this.rootIdx,
            chordName: this.chordName,
            visible: this.visible,
        };
    }
}

export const rebuildDiffs = (fretboards: FretboardUtil[]) => {
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
    fretboards: FretboardUtil[],
    focusedIndex: number
) {
    fretboards = fretboards.map((fretboard) => fretboard.copy());
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
    fretboardA: FretboardUtil,
    fretboardB: FretboardUtil,
    diff: DiffType
) {
    for (let stringIndex in fretboardA.strings) {
        const string = fretboardA.strings[stringIndex];
        for (let fretValue in string) {
            const diffValue = diff[mod(+fretValue, 12)];
            const isHighlighted = string[+fretValue];
            const slidesInDiff =
                diffValue !== undefined && Math.abs(diffValue) < 9999;
            if (slidesInDiff) {
                const fretDestinationValue = +fretValue + diffValue;
                fretboardB.setFret(
                    stringIndex,
                    fretDestinationValue,
                    isHighlighted
                );
            }
        }
    }
}
