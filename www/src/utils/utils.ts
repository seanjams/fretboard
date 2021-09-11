import { DEFAULT_NOTESWITCH, DEFAULT_STRINGSWITCH } from "./consts";
import { FretboardUtil, mod } from "./fretboard";
import { NoteSwitchType, KeyControlTypes, DiffType } from "../types";
import { kCombinations } from "./combinations";

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
    const noteswitch = DEFAULT_NOTESWITCH();
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
    // reset fretboardB's highlighted notes
    fretboardB.strings = DEFAULT_STRINGSWITCH();
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
