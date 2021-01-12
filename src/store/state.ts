import { FretboardUtil } from "../utils";
import { LabelTypes } from "../types";
import { C_PENTATONIC, STRING_SIZE } from "../consts";

export type StateType = {
	fretboards: Array<FretboardUtil>;
	label: LabelTypes;
	invert?: boolean;
	stringSize: number;
	focusedIndex: number;
};

export const DEFAULT_STATE: StateType = {
	fretboards: [new FretboardUtil(C_PENTATONIC)],
	label: "flat",
	invert: false,
	stringSize: STRING_SIZE,
	focusedIndex: 0,
};
