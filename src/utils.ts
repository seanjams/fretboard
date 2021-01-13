import {
	SHARP_NAMES,
	FLAT_NAMES,
	DEFAULT_NOTESWITCH,
	DEFAULT_STRINGSWITCH,
	STANDARD_TUNING,
	STRING_SIZE,
} from "./consts";
import {
	NoteTypes,
	LabelTypes,
	NoteSwitchType,
	StringSwitchType,
	numString,
} from "./types";

export function copy(obj: any): any {
	return JSON.parse(JSON.stringify(obj));
}

export function mod(a: numString, m: number): number {
	return ((+a % m) + m) % m;
}

export function shuffleArray(array: any[]): void {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export const COLORS = [
	["#C1BFB5", "#B02E0C"],
	["#DBB3B1", "#6C534E"],
	["#F2E3BC", "#618985"],
	["#BBDFC5", "#14342B"],
	["#CEDFD9", "#9B6A6C"],
	["#E5D4ED", "#5941A9"],
	["#D7BEA8", "#744253"],
	["#CAD2C5", "#52489C"],
];
shuffleArray(COLORS);

export class NoteUtil {
	base: number;
	constructor(base: number) {
		this.base = mod(base, 12);
	}

	getName(label: LabelTypes): NoteTypes {
		if (label === "sharp") {
			return SHARP_NAMES[this.base];
		} else if (label === "flat") {
			return FLAT_NAMES[this.base];
		}
	}
}

export class FretboardUtil {
	notes: NoteSwitchType;
	strings: StringSwitchType;

	constructor(
		notes: NoteSwitchType | null = DEFAULT_NOTESWITCH,
		strings: StringSwitchType | null = DEFAULT_STRINGSWITCH
	) {
		this.notes = notes;
		this.strings = strings;
	}

	get(index: numString): boolean {
		return !!this.notes[mod(+index, 12)];
	}

	set(index: numString, active: boolean): boolean {
		if (!active) {
			this.clearFrets(mod(+index, 12));
		}
		return (this.notes[mod(+index, 12)] = active);
	}

	toggle(index: number): boolean {
		return this.set(index, !this.get(index));
	}

	getFret(stringIndex: numString, fretValue: numString): boolean {
		return !!this.strings[mod(+stringIndex, 6)][+fretValue];
	}

	setFret(
		stringIndex: numString,
		fretValue: numString,
		active: boolean
	): boolean {
		if (active) {
			this.set(fretValue, active);
		}
		return (this.strings[mod(+stringIndex, 6)][+fretValue] = active);
	}

	toggleFret(stringIndex: number, fretValue: number): boolean {
		return this.setFret(
			stringIndex,
			fretValue,
			!this.getFret(stringIndex, fretValue)
		);
	}

	clearFrets(index: number): void {
		for (let i in this.strings) {
			for (let j in this.strings[i]) {
				if (this.getFret(i, j) && mod(j, 12) == index) {
					this.setFret(i, j, false);
				}
			}
		}
	}

	list(): number[] {
		const result: number[] = [];
		Object.keys(this.notes).forEach((note, i) => {
			if (note) {
				result.push(i);
			}
		});
		return result;
	}

	listString(stringIndex: number): number[] {
		return Object.keys(this.strings[mod(stringIndex, 6)])
			.map(key => +key)
			.sort((a: number, b: number) => a - b);
	}

	_getIncrement(value: number, inc: number, scale: number[]): number {
		if (inc === 0) return value;

		const currentDelta = value - mod(value, 12);
		const currentIndex = scale.indexOf(mod(value, 12));
		if (currentIndex < 0) return value;

		const nextIndex = mod(currentIndex + inc, scale.length);
		const nextDelta = 12 * Math.floor((currentIndex + inc) / scale.length);
		return currentDelta + scale[nextIndex] + nextDelta;
	}

	_getVerticalIntervalIncrement(scale: number[], inc: number): number {
		let min = 12;
		let minStep: number;

		for (let scaleStep = 1; scaleStep < scale.length; scaleStep++) {
			// get average interval between different scale steps
			let average = 0;
			for (let i = 0; i < scale.length; i++) {
				const interval = mod(scale[mod(i + scaleStep, scale.length)] - scale[i], 12);
				average += interval;
			}
			average = Math.abs(average / scale.length);
			
			// Get distance from most "vertical" possible interval, the perfect 4th
			const averageVerticalDelta = Math.abs(average - 5);
			if (averageVerticalDelta < min) {
				min = averageVerticalDelta;
				minStep = scaleStep;
			}
		}

		return (inc < 0 ? -1 : 1) * minStep;
	}

	incrementPosition(inc: number, vertical: boolean): boolean {
		const turnOff: [numString, numString][] = [];
		const turnOn: [numString, numString][] = [];

		const scale: number[] = Object.keys(this.notes)
			.map(key => +key)
			.filter(key => this.notes[key]);
		let verticalIntervalIncrement = vertical ? this._getVerticalIntervalIncrement(scale, inc) : 0;

		let valid = true;
		for (let stringIndex in this.strings) {
			const newStringIndex: number = vertical ? +stringIndex + inc : +stringIndex;
			for (let fretValue in this.strings[stringIndex]) {
				if (this.getFret(stringIndex, fretValue)) {
					let newValue: number;
					let conditions: boolean[];
					if (vertical) {
						// get most vertical interval step, find new note value, and apply to next string
						newValue = this._getIncrement(+fretValue, verticalIntervalIncrement, scale);
						conditions = [
							newStringIndex < 0,
							newStringIndex >= this.strings.length,
							newValue < STANDARD_TUNING[newStringIndex],
							newValue >= STANDARD_TUNING[newStringIndex] + STRING_SIZE
						];
					} else {
						// find new note value, and apply to same string
						newValue = this._getIncrement(+fretValue, inc, scale);
						conditions = [
							newValue === +fretValue,
							newValue < STANDARD_TUNING[stringIndex],
							newValue >= STANDARD_TUNING[stringIndex] + STRING_SIZE
						];
					}
					
					if (conditions.some(_ => _)) {
						valid = false;
						break;
					}

					turnOff.push([stringIndex, fretValue]);
					turnOn.push([newStringIndex, newValue]);
				}
			}
			if (!valid) {
				break;
			}
		}

		if (valid) {
			for (let change of turnOff) {
				this.setFret(change[0], change[1], false);
			}

			for (let change of turnOn) {
				this.setFret(change[0], change[1], true);
			}
		}

		return valid && !!turnOff.length && !!turnOn.length;
	}

	copy(): FretboardUtil {
		return new FretboardUtil(copy(this.notes), copy(this.strings));
	}
}
