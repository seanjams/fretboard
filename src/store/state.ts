import { FretboardUtil } from "../utils";
import { LabelTypes } from "../types";
import { C_PENTATONIC, STRING_SIZE } from "../consts";

export interface StateType {
	fretboards: Array<FretboardUtil>;
	label: LabelTypes;
	invert?: boolean;
	leftHand?: boolean;
	stringSize: number;
	focusedIndex: number;
}

export class StateModel implements StateType {
	fretboards: Array<FretboardUtil>;
	label: LabelTypes;
	invert?: boolean;
	leftHand?: boolean;
	stringSize: number;
	focusedIndex: number;

	constructor(obj: any = undefined) {
		if (obj) {
			this.fretboards = obj.fretboards;
			this.label = obj.label;
			this.invert = obj.invert;
			this.leftHand = obj.leftHand;
			this.stringSize = obj.stringSize;
			this.focusedIndex = obj.focusedIndex;
		}
	}

	static parseItem(key: keyof StateType): any {
		let value: any = localStorage.getItem(key);
		if (value) {
			try {
				value = JSON.parse(value);
				if (key === "fretboards" && Array.isArray(value)) {
					value = value.map(
						(fretboard) =>
							new FretboardUtil(
								fretboard.notes,
								fretboard.strings
							)
					);
				}
			} catch (e) {}
		}
		return value;
	}

	static default(): StateType {
		return new StateModel({
			fretboards: [new FretboardUtil(C_PENTATONIC)],
			label: "flat",
			invert: false,
			leftHand: false,
			stringSize: STRING_SIZE,
			focusedIndex: 0,
		}).toJSON();
	}

	static fromLocalStorage(): StateType {
		const defaultState = StateModel.default();
		const json: StateType = {
			fretboards:
				StateModel.parseItem("fretboards") || defaultState.fretboards,
			label: StateModel.parseItem("label") || defaultState.label,
			invert: StateModel.parseItem("invert") || defaultState.invert,
			leftHand: StateModel.parseItem("leftHand") || defaultState.leftHand,
			stringSize:
				StateModel.parseItem("stringSize") || defaultState.stringSize,
			focusedIndex:
				StateModel.parseItem("focusedIndex") ||
				defaultState.focusedIndex,
		};
		return json;
	}

	toJSON(): StateType {
		const json: StateType = {
			fretboards: this.fretboards,
			label: this.label,
			invert: this.invert,
			leftHand: this.leftHand,
			stringSize: this.stringSize,
			focusedIndex: this.focusedIndex,
		};
		return json;
	}
}
