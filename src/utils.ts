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
	ArrowTypes,
	KeyControlTypes,
} from "./types";

export function copy(obj: any): any {
	return JSON.parse(JSON.stringify(obj));
}

export function mod(a: numString, m: number): number {
	return ((+a % m) + m) % m;
}

export function stopClick() {
	// can be placed within a mouseup event to prevent
	// the subsequent click event
	window.addEventListener("click", captureClick, true);
	function captureClick(e: MouseEvent | TouchEvent) {
		e.stopPropagation();
		window.removeEventListener("click", captureClick, true);
	}
}

export function getPositionActionType(
	invert: boolean,
	leftHand: boolean,
	direction: string
): KeyControlTypes | null {
	// Get the action direction based on orientation of fretboard
	// could maybe move this to reducer.
	// highEBottom
	// 	- whether the high E string appears on the top or bottom of the fretboard,
	// 	- depending on invert/leftHand views
	const highEBottom = invert !== leftHand;
	const keyMap: { [key: string]: KeyControlTypes } = {
		ArrowUp: highEBottom ? "DECREMENT_POSITION_Y" : "INCREMENT_POSITION_Y",
		ArrowDown: highEBottom
			? "INCREMENT_POSITION_Y"
			: "DECREMENT_POSITION_Y",
		ArrowRight: invert ? "DECREMENT_POSITION_X" : "INCREMENT_POSITION_X",
		ArrowLeft: invert ? "INCREMENT_POSITION_X" : "DECREMENT_POSITION_X",
	};

	return keyMap[direction];
}

// export function shuffleArray(array: any[]): void {
//     for (let i = array.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [array[i], array[j]] = [array[j], array[i]];
//     }
// }

export const COLORS = [
	["#C1BFB5", "#B02E0C"],
	// ["#DBB3B1", "#6C534E"],
	// ["#F2E3BC", "#618985"],
	// ["#BBDFC5", "#14342B"],
	// ["#CEDFD9", "#9B6A6C"],
	// ["#E5D4ED", "#5941A9"],
	// ["#D7BEA8", "#744253"],
	// ["#CAD2C5", "#52489C"],
];
// shuffleArray(COLORS);

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

export interface FretboardUtilType {
	notes: NoteSwitchType;
	strings: StringSwitchType;
}

export class FretboardUtil implements FretboardUtilType {
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
			if (this.notes[+note]) {
				result.push(i);
			}
		});
		return result;
	}

	listString(stringIndex: number): number[] {
		return Object.keys(this.strings[mod(stringIndex, 6)])
			.map((key) => +key)
			.sort((a: number, b: number) => a - b);
	}

	compare1(fretboard: FretboardUtil) {
		const list = this.list();
		const compareList = fretboard.list();
		const rotations = list.map((_, i) => (j: number) =>
			(j + i) % list.length
		);
		let results: { [key: number]: { [key: number]: number } } = {};

		function rotatedDistance(a: number, b: number, m: number) {
			let min = a - b;
			if (Math.abs(a - b + m) < Math.abs(min)) min = a - b + m;
			if (Math.abs(a - b - m) < Math.abs(min)) min = a - b - m;
			return min;
		}

		for (let rotation of rotations) {
			let result: { [key: number]: number } = {};
			for (let i = 0; i < list.length; i++) {
				let j = rotation(i);
				result[list[i]] = rotatedDistance(compareList[j], list[i], 12);
			}

			const sum = Object.values(result)
				.map((d) => d * d)
				.reduce((acc, el) => acc + el);

			results[sum] = result;
		}

		let min;
		for (let sum in results) {
			if (min === undefined || +sum < min) {
				min = +sum;
			}
		}

		return results[min];
	}

	// compare2(fretboard: FretboardUtil) {
	// 	// simple implementation for now, needs to be refined
	// 	const list = this.list();
	// 	const compareList = fretboard.list();
	// 	const result: { [key: number]: number } = {};

	// function rotatedDistance(a: number, b: number, m: number) {
	// 	let min = a - b;
	// 	if (Math.abs(a - b + m) < Math.abs(min)) min = a - b + m;
	// 	if (Math.abs(a - b - m) < Math.abs(min)) min = a - b - m;
	// 	return min;
	// }

	// 	// direct compare
	// 	for (let i = 0; i < list.length; i++) {
	// 		let min;
	// 		for (let j = 0; j < compareList.length; j++) {
	// 			const distance = rotatedDistance(compareList[j], list[i], 12);
	// 			if (min === undefined || distance * distance <= min * min) {
	// 				min = distance;
	// 			}
	// 		}
	// 		result[list[i]] = min;
	// 	}

	// 	return result;
	// }

	compare(fretboard: FretboardUtil) {
		const list = this.list();
		const compareList = fretboard.list();

		function rotatedDistance(a: number, b: number, m: number) {
			let min = a - b;
			if (Math.abs(a - b + m) < Math.abs(min)) min = a - b + m;
			if (Math.abs(a - b - m) < Math.abs(min)) min = a - b - m;
			return min;
		}

		type itemType = {
			toIndex: number[];
			fromIndex: number;
			distance: number;
		};

		const available: { [key in number]: boolean } = {};
		compareList.forEach((index) => (available[index] = true));

		// let minItems: number[][] = [];
		let minItems = [];
		for (let i = 0; i < list.length; i++) {
			let distances = compareList.map((index) => ({
				toIndex: index,
				distance: rotatedDistance(index, list[i], 12),
			}));
			if (distances.length) {
				distances.sort(
					(a, b) => Math.abs(a.distance) - Math.abs(b.distance)
				);

				distances = distances.filter(
					(distance) =>
						Math.abs(distance.distance) ===
						Math.abs(distances[0].distance)
				);

				minItems.push({
					distance: distances.map((distance) => distance.distance),
					fromIndex: list[i],
					toIndex: distances.map((distance) => distance.toIndex),
				});
			}
		}

		minItems.sort(
			(a, b) => Math.abs(a.distance[0]) - Math.abs(b.distance[0])
		);

		const result: { [key in number]: number } = {};

		for (let item of minItems) {
			const { fromIndex, toIndex, distance } = item;
			for (let i = 0; i < toIndex.length; i++) {
				const index = toIndex[i];
				const d = distance[i];
				if (available[index]) {
					result[fromIndex] = d;
					available[index] = false;
					break;
				}
			}
		}

		for (let index of list) {
			if (result[index] === undefined) result[index] = -9999;
		}

		// maybe fix for later
		for (let index of Object.keys(available)) {
			if (available[+index]) result[+index] = 9999;
		}

		return result;
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
				const interval = mod(
					scale[mod(i + scaleStep, scale.length)] - scale[i],
					12
				);
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
			.map((key) => +key)
			.filter((key) => this.notes[key]);
		let verticalIntervalIncrement = vertical
			? this._getVerticalIntervalIncrement(scale, inc)
			: 0;

		let valid = true;
		for (let stringIndex in this.strings) {
			const newStringIndex: number = vertical
				? +stringIndex + inc
				: +stringIndex;
			for (let fretValue in this.strings[stringIndex]) {
				if (this.getFret(stringIndex, fretValue)) {
					let newValue: number;
					let conditions: boolean[];
					if (vertical) {
						// get most vertical interval step, find new note value, and apply to next string
						newValue = this._getIncrement(
							+fretValue,
							verticalIntervalIncrement,
							scale
						);
						conditions = [
							newStringIndex < 0,
							newStringIndex >= this.strings.length,
							newValue < STANDARD_TUNING[newStringIndex],
							newValue >=
								STANDARD_TUNING[newStringIndex] + STRING_SIZE,
						];
					} else {
						// find new note value, and apply to same string
						newValue = this._getIncrement(+fretValue, inc, scale);
						conditions = [
							newValue === +fretValue,
							newValue < STANDARD_TUNING[stringIndex],
							newValue >=
								STANDARD_TUNING[stringIndex] + STRING_SIZE,
						];
					}

					if (conditions.some((_) => _)) {
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

	toJSON(): FretboardUtilType {
		return {
			notes: copy(this.notes),
			strings: copy(this.strings),
		};
	}
}
