import { SHARP_NAMES, FLAT_NAMES } from "./consts";
import { NoteTypes, LabelTypes } from "./types";

export class NoteUtil {
	base: number;

	constructor(base: number) {
		this.base = base;
	}

	getName(label: LabelTypes): NoteTypes {
		if (label === "sharp") {
			return SHARP_NAMES[this.base];
		} else if (label === "flat") {
			return FLAT_NAMES[this.base];
		}
	}
}

export const NOTE_BANK = Array(12)
	.fill(0)
	.map((_, i) => new NoteUtil(i));
