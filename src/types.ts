export type numString = number | string;

export type LabelTypes = "sharp" | "flat" | "value";

export type NaturalTypes = "B" | "C" | "D" | "E" | "F" | "G" | "A";

export type SharpTypes = "C#" | "D#" | "F#" | "G#" | "A#" | NaturalTypes;

export type FlatTypes = "Db" | "Eb" | "Gb" | "Ab" | "Bb" | NaturalTypes;

export type NoteTypes = NaturalTypes | SharpTypes | FlatTypes;

export type NoteSwitchType = {
	[key: number]: boolean;
};

export type StringSwitchType = [
	NoteSwitchType,
	NoteSwitchType,
	NoteSwitchType,
	NoteSwitchType,
	NoteSwitchType,
	NoteSwitchType
];
