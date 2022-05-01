import { DiffType, FretboardType, FretboardDiffType } from "../types";
import {
    clearHighlight,
    DEFAULT_FRETBOARD,
    getFretIndicesFromValue,
    getFretValue,
    HIGHLIGHTED,
    list,
    mod,
    NOT_SELECTED,
    setFret,
} from "../utils";
import { kCombinations } from "./combinations";

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

export function rebuildCarryOverDiffs(
    fretboards: FretboardType[],
    leftDiffs: DiffType[],
    rightDiffs: DiffType[]
) {
    // Handles frets that are emptied by diff in transition from fretboardA to fretboardB,
    // because fretboardB had less notes in it. We should "carry over" the emptied frets
    // to the next fretboard in _cascadeHighlight, so all fretboards have the
    // maximum possible notes selected.

    // 1. Go through each right/left diff in order.
    // 2. In each step, create two fretboards
    //  - out of the current diff's emptied notes
    //  - out of the next diff's filled notes
    //  - must keep current statuses of fretboard notes
    // 3. Run compare on these two fretboards and collect the corresponding left/right diff
    // 4. Notes that slide in this new diff are the "carry over notes"
    // 5. Iterate over these new diffs, and update the actual diffs so that
    //  - Any note that is being filled checks the carryOver notes to decide
    //    if it should be highlighted or not
    function carryOver(
        currentFretboard: FretboardType,
        nextFretboard: FretboardType,
        currentDiff: DiffType,
        nextDiff: DiffType
    ) {
        const fretboardA = DEFAULT_FRETBOARD();
        const fretboardB = DEFAULT_FRETBOARD();
        Object.entries(currentDiff).forEach(([fretValue, diffSlide]) => {
            if (diffSlide <= -9999) {
                const fretIndices = getFretIndicesFromValue(+fretValue);
                fretIndices.forEach(([stringIndex, fretIndex]) => {
                    fretboardA.strings[stringIndex][fretIndex] =
                        currentFretboard.strings[stringIndex][fretIndex];
                });
            }
        });
        Object.entries(nextDiff).forEach(([fretValue, diffSlide]) => {
            if (diffSlide >= 9999) {
                const fretIndices = getFretIndicesFromValue(+fretValue);
                fretIndices.forEach(([stringIndex, fretIndex]) => {
                    fretboardB.strings[stringIndex][fretIndex] =
                        nextFretboard.strings[stringIndex][fretIndex];
                });
            }
        });
        return compare(fretboardA, fretboardB);
    }

    let carryOverLeftDiffs: FretboardDiffType[] = [];
    let carryOverRightDiffs: FretboardDiffType[] = [];

    for (let i = leftDiffs.length - 1; i > 0; i--) {
        const currentFretboard = fretboards[i];
        const nextFretboard = fretboards[i - 2];
        const currentDiff = leftDiffs[i];
        const nextDiff = leftDiffs[i - 1];
        if (!currentFretboard || !nextFretboard || !currentDiff || !nextDiff)
            continue;
        const carryOverDiff = carryOver(
            currentFretboard,
            nextFretboard,
            currentDiff,
            nextDiff
        )[1];
        const carryOverFretboardDiff = diffToFretboardDiff(
            carryOverDiff,
            currentFretboard,
            nextFretboard
        );
        carryOverLeftDiffs[i - 1] = carryOverFretboardDiff;
    }

    for (let i = 0; i < rightDiffs.length - 1; i++) {
        const currentFretboard = fretboards[i];
        const nextFretboard = fretboards[i + 2];
        const currentDiff = rightDiffs[i];
        const nextDiff = rightDiffs[i + 1];
        if (!currentFretboard || !nextFretboard || !currentDiff || !nextDiff)
            continue;
        const carryOverDiff = carryOver(
            currentFretboard,
            nextFretboard,
            currentDiff,
            nextDiff
        )[1];
        const carryOverFretboardDiff = diffToFretboardDiff(
            carryOverDiff,
            currentFretboard,
            nextFretboard
        );
        carryOverRightDiffs[i + 1] = carryOverFretboardDiff;
    }

    return {
        carryOverLeftDiffs,
        carryOverRightDiffs,
    };
}

export function _rebuildDiffs(fretboards: FretboardType[], carryOver = false) {
    const leftDiffs: FretboardDiffType[] = [];
    const rightDiffs: FretboardDiffType[] = [];
    const _leftDiffs: DiffType[] = [];
    const _rightDiffs: DiffType[] = [];

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

        if (rightDiff && rightFretboardDiff) {
            _rightDiffs[i] = rightDiff;
            rightDiffs[i] = rightFretboardDiff;
        }
        if (leftDiff && leftFretboardDiff && i + 1 < fretboards.length) {
            _leftDiffs[i + 1] = leftDiff;
            leftDiffs[i + 1] = leftFretboardDiff;
        }
    }

    let carryOverDiffs: {
        carryOverLeftDiffs: FretboardDiffType[];
        carryOverRightDiffs: FretboardDiffType[];
    } = {
        carryOverLeftDiffs: [],
        carryOverRightDiffs: [],
    };
    if (carryOver) {
        carryOverDiffs = rebuildCarryOverDiffs(
            fretboards,
            _leftDiffs,
            _rightDiffs
        );
    }

    return {
        fretboards,
        leftDiffs,
        rightDiffs,
        ...carryOverDiffs,
    };
}

export function rebuildDiffs(fretboards: FretboardType[]) {
    return _rebuildDiffs(fretboards, false);
}

export function cascadeDiffs(
    fretboards: FretboardType[],
    currentFretboardIndex: number
) {
    fretboards = JSON.parse(JSON.stringify(fretboards));
    fretboards.forEach((fretboard, i) => {
        if (currentFretboardIndex !== i) clearHighlight(fretboard);
    });
    const diffs = _rebuildDiffs(fretboards, true);

    // left
    for (let i = currentFretboardIndex; i >= 0; i--) {
        let diff = diffs.leftDiffs[i];
        let fretboardA = fretboards[i];
        let fretboardB = fretboards[i - 1];
        if (!fretboardB) break;
        let carryOverDiff = undefined;
        let carryOverFretboard = undefined;
        if (i < currentFretboardIndex) {
            carryOverDiff =
                diffs.carryOverLeftDiffs && diffs.carryOverLeftDiffs[i];
            carryOverFretboard = fretboards[i + 1];
        }
        _cascadeHighlight(
            fretboardA,
            fretboardB,
            diff,
            carryOverDiff,
            carryOverFretboard
        );
    }

    // reset carryOverFrets
    // carryOverFrets = [];

    // right
    for (let i = currentFretboardIndex; i < fretboards.length; i++) {
        let diff = diffs.rightDiffs[i];
        let fretboardA = fretboards[i];
        let fretboardB = fretboards[i + 1];
        if (!fretboardB) break;
        let carryOverDiff = undefined;
        let carryOverFretboard = undefined;
        if (i > currentFretboardIndex) {
            carryOverDiff =
                diffs.carryOverRightDiffs && diffs.carryOverRightDiffs[i];
            carryOverFretboard = fretboards[i - 1];
        }
        _cascadeHighlight(
            fretboardA,
            fretboardB,
            diff,
            carryOverDiff,
            carryOverFretboard
        );
    }

    return { ...diffs, fretboards };
}

// starting at fretboardA, check all strings for any highlighted notes,
// and copy them to corresponding notes on fretboardB via diff
export function _cascadeHighlight(
    fretboardA: FretboardType,
    fretboardB: FretboardType,
    diff: FretboardDiffType,
    carryOverDiff?: FretboardDiffType,
    carryOverFretboard?: FretboardType
) {
    // reset fretboardB's highlighted notes
    clearHighlight(fretboardB);
    const shouldCarryOver = !!(carryOverDiff && carryOverFretboard);

    for (let stringIndex in fretboardA.strings) {
        const fretString = fretboardA.strings[stringIndex];
        const carryOverFretString = shouldCarryOver
            ? carryOverFretboard.strings[stringIndex]
            : undefined;
        for (let fretIndex in fretString) {
            const status = fretString[fretIndex];
            const diffValue = diff[+stringIndex][+fretIndex];
            const slidesInDiff =
                diffValue !== undefined && Math.abs(diffValue) < 9999;
            const carryOverDiffValue = shouldCarryOver
                ? carryOverDiff[+stringIndex][+fretIndex]
                : undefined;
            const slidesInCarryOverDiff =
                carryOverDiffValue !== undefined &&
                Math.abs(carryOverDiffValue) < 9999;
            if (slidesInDiff) {
                const fretDestinationIndex = +fretIndex + diffValue;
                setFret(fretboardB, +stringIndex, fretDestinationIndex, status);
            } else if (slidesInCarryOverDiff) {
                const fretDestinationIndex = +fretIndex + carryOverDiffValue;
                const carryOverStatus = carryOverFretString
                    ? carryOverFretString[fretIndex]
                    : NOT_SELECTED;
                setFret(
                    fretboardB,
                    +stringIndex,
                    fretDestinationIndex,
                    carryOverStatus
                );
            }
        }
    }
}
