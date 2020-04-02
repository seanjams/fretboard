import { FretboardUtil } from "../utils";
import { LabelTypes } from "../types";
import { STRING_SIZE } from "../consts";

export type StateType = {
	fretboard: FretboardUtil;
	label: LabelTypes;
	invert?: boolean;
	stringSize: number;
};

export const DEFAULT_STATE: StateType = {
	fretboard: new FretboardUtil(),
	label: "flat",
	invert: false,
	stringSize: STRING_SIZE,
};
