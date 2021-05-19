import { FretboardUtil, compare, mod } from "../utils";
import { LabelTypes, DiffType } from "../types";
import { C_PENTATONIC, STRING_SIZE } from "../consts";

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
	lockHighlight: boolean;
}

export const rebuildDiffs = (
	fretboards: FretboardUtil[],
	lockHighlight: boolean
) => {
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

		// iterate over strings of fretboard, checking if note exists as highlighted note on string,
		// and then set a highlighted note on the next fretboard with the fret + diff delta
		if (lockHighlight && compareFretboard) {
			function setHighlightedAcrossDiff(
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
							diffValue !== undefined &&
							Math.abs(diffValue) < 9999;
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

			setHighlightedAcrossDiff(fretboard, compareFretboard, rightDiff);
			setHighlightedAcrossDiff(compareFretboard, fretboard, leftDiff);
		}
	}

	return {
		fretboards,
		leftDiffs,
		rightDiffs,
	};
};

const fretboards = [new FretboardUtil(C_PENTATONIC)];
export function DEFAULT_STATE(): StateType {
	return {
		...rebuildDiffs(fretboards, true),
		label: "flat",
		invert: false,
		leftHand: false,
		stringSize: STRING_SIZE,
		focusedIndex: 0,
		rehydrateSuccess: false,
		lockHighlight: true,
	};
}
