import { FretboardUtil, compare } from "../utils";
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

const fretboards = [new FretboardUtil(C_PENTATONIC)];
export function DEFAULT_STATE(): StateType {
	return {
		...rebuildDiffs(fretboards),
		label: "flat",
		invert: false,
		leftHand: false,
		stringSize: STRING_SIZE,
		focusedIndex: 0,
		rehydrateSuccess: false,
	};
}
