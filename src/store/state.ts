import { DEFAULT_NOTESWITCH } from "../consts";
import { NoteSwitchType, LabelTypes } from "../types";

export type StateType = {
	selectedNotes: NoteSwitchType;
	label: LabelTypes;
	invert?: boolean;
	stringSize: number;
	notesPerString: number;
	position: number;
};

export const DEFAULT_STATE: StateType = {
	selectedNotes: { ...DEFAULT_NOTESWITCH },
	label: "flat",
	invert: false,
	stringSize: 24,
	notesPerString: 3,
	position: 0,
};
