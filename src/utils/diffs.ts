import { DiffType, FretboardType, FretboardDiffType } from "../types";
import {
    clearHighlight,
    DEFAULT_FRETBOARD,
    getFretValue,
    list,
    mod,
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
            const fretValue = getFretValue(+stringIndex, +fretIndex, true);
            if (diff[fretValue] !== undefined) {
                const destinationIndex =
                    Math.abs(diff[fretValue]) >= 9999
                        ? +fretIndex
                        : +fretIndex + diff[fretValue];
                fretboardDiff[+stringIndex][+fretIndex] = {
                    slide: diff[fretValue],
                    fromStatus: fretboardA.strings[+stringIndex][+fretIndex],
                    toStatus:
                        fretboardB.strings[+stringIndex][destinationIndex],
                };
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

export function rebuildDiffs(fretboards: FretboardType[]) {
    const leftDiffs: FretboardDiffType[] = [];
    const rightDiffs: FretboardDiffType[] = [];

    for (let i = 0; i < fretboards.length; i++) {
        const fretboard = fretboards[i];
        const compareFretboard = fretboards[i + 1];
        if (!compareFretboard) continue;
        const [basicLeftDiff, basicRightDiff] = compare(
            fretboard,
            compareFretboard
        );
        const leftDiff = diffToFretboardDiff(
            basicLeftDiff,
            compareFretboard,
            fretboard
        );
        const rightDiff = diffToFretboardDiff(
            basicRightDiff,
            fretboard,
            compareFretboard
        );

        rightDiffs[i] = rightDiff;
        if (i + 1 < fretboards.length) {
            leftDiffs[i + 1] = leftDiff;
        }
    }

    return {
        fretboards,
        leftDiffs,
        rightDiffs,
    };
}

function _copyDiffToFretboard(
    currentDiff: FretboardDiffType,
    nextFretboard: FretboardType,
    condition: "fill" | "empty"
) {
    for (let stringIndex in currentDiff) {
        for (let fretIndex in currentDiff[stringIndex]) {
            const diff = currentDiff[stringIndex][+fretIndex];
            let shouldCopy = false;
            let status = diff.fromStatus;
            if (condition === "fill") {
                shouldCopy = diff.slide >= 9999;
                status = diff.toStatus;
            } else if (condition === "empty") {
                shouldCopy = diff.slide <= -9999;
                status = diff.fromStatus;
            }
            if (shouldCopy) {
                nextFretboard.strings[stringIndex][fretIndex] = status;
            }
        }
    }
}

function _buildCarryOverDiff(
    currentFretboard: FretboardType,
    nextFretboard: FretboardType,
    currentDiff: FretboardDiffType,
    nextDiff: FretboardDiffType,
    stragglerDiff: FretboardDiffType
): [FretboardDiffType, FretboardDiffType] | undefined {
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
    // 6. Notes that disappear (-9999) in this new diff are "stragglers",
    //    these should be collected and reapplied to next carryOver notes

    if (!currentFretboard || !nextFretboard || !currentDiff || !nextDiff)
        return;
    const fretboardA = DEFAULT_FRETBOARD();
    const fretboardB = DEFAULT_FRETBOARD();
    _copyDiffToFretboard(stragglerDiff, fretboardA, "empty");
    _copyDiffToFretboard(currentDiff, fretboardA, "empty");
    _copyDiffToFretboard(nextDiff, fretboardB, "fill");
    const carryOverDiff = compare(fretboardA, fretboardB)[1];
    const carryOverFretboardDiff = diffToFretboardDiff(
        carryOverDiff,
        fretboardA,
        fretboardB
    );

    stragglerDiff = [{}, {}, {}, {}, {}, {}];
    for (let stringIndex in carryOverFretboardDiff) {
        for (let fretIndex in carryOverFretboardDiff[stringIndex]) {
            const fretDiff = carryOverFretboardDiff[stringIndex][fretIndex];
            if (fretDiff.slide <= -9999) {
                // these frets did not get mapped in the carryOver process, and need to be collected
                stragglerDiff[stringIndex][fretIndex] = { ...fretDiff };
            }
        }
    }

    return [carryOverFretboardDiff, stragglerDiff];
}

// starting at fretboardA, check all strings for any highlighted notes,
// and copy them to corresponding notes on fretboardB via diff
function _cascadeHighlight(
    currentFretboard: FretboardType,
    nextFretboard: FretboardType,
    currentDiff: FretboardDiffType,
    nextDiff: FretboardDiffType,
    carryOverDiff?: FretboardDiffType
) {
    // reset nextFretboard's highlighted notes
    clearHighlight(nextFretboard);
    for (let stringIndex in currentFretboard.strings) {
        const fretString = currentFretboard.strings[stringIndex];
        for (let fretIndex in fretString) {
            const fretDiff =
                currentDiff && currentDiff[+stringIndex][+fretIndex];
            const diffValue = fretDiff && fretDiff.slide;
            const slidesInDiff =
                diffValue !== undefined && Math.abs(diffValue) < 9999;
            if (slidesInDiff) {
                const fretDestinationIndex = +fretIndex + diffValue;
                const status = fretString[fretIndex];
                setFret(
                    nextFretboard,
                    +stringIndex,
                    fretDestinationIndex,
                    status
                );

                const nextFretDiff =
                    nextDiff && nextDiff[+stringIndex][fretDestinationIndex];
                if (nextFretDiff) nextFretDiff.fromStatus = status;
                continue;
            }

            // if not set from current diff, attempt to carry over new fret status
            const carryDiff = carryOverDiff
                ? carryOverDiff[+stringIndex][+fretIndex]
                : undefined;
            const carryDiffValue = carryDiff && carryDiff.slide;
            const slidesInCarryOverDiff =
                carryDiffValue !== undefined && Math.abs(carryDiffValue) < 9999;
            if (carryDiff && slidesInCarryOverDiff) {
                const fretDestinationIndex = +fretIndex + carryDiffValue;
                const carryOverStatus = carryDiff.fromStatus;
                setFret(
                    nextFretboard,
                    +stringIndex,
                    fretDestinationIndex,
                    carryOverStatus
                );

                const nextFretDiff =
                    nextDiff && nextDiff[+stringIndex][fretDestinationIndex];
                if (nextFretDiff) nextFretDiff.fromStatus = carryOverStatus;
            }
        }
    }
}

export function cascadeDiffs(
    currentFretboards: FretboardType[],
    currentFretboardIndex: number
) {
    currentFretboards = JSON.parse(JSON.stringify(currentFretboards));
    currentFretboards.forEach((fretboard, i) => {
        if (currentFretboardIndex !== i) clearHighlight(fretboard);
    });
    const { fretboards, leftDiffs, rightDiffs } =
        rebuildDiffs(currentFretboards);

    // closure around fretboards/diffs
    function cascadeHighlight(reverse = false) {
        const n = reverse ? -1 : 1;
        const diffs = reverse ? leftDiffs : rightDiffs;
        let stragglerDiff: FretboardDiffType = [{}, {}, {}, {}, {}, {}];
        for (
            let i = currentFretboardIndex;
            reverse ? i >= 0 : i < fretboards.length;
            reverse ? i-- : i++
        ) {
            let currentDiff = diffs[i];
            let nextDiff = diffs[i + n * 1];
            let currentFretboard = fretboards[i];
            let nextFretboard = fretboards[i + n * 1];
            if (!nextFretboard) break;
            let shouldCarryOver = reverse
                ? i < currentFretboardIndex
                : i > currentFretboardIndex;
            let carryOverDiff = undefined;
            if (shouldCarryOver) {
                const prevFretboard = fretboards[i - n * 1];
                const prevDiff = diffs[i - n * 1];
                const carryOver = _buildCarryOverDiff(
                    prevFretboard,
                    nextFretboard,
                    prevDiff,
                    currentDiff,
                    stragglerDiff
                );
                if (carryOver) {
                    [carryOverDiff, stragglerDiff] = carryOver;
                }
            }
            _cascadeHighlight(
                currentFretboard,
                nextFretboard,
                currentDiff,
                nextDiff,
                carryOverDiff
            );
        }
    }

    cascadeHighlight(true);
    cascadeHighlight(false);

    return rebuildDiffs(fretboards);
}
