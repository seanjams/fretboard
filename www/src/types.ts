export type numString = number | string;

export type LabelTypes = "sharp" | "flat" | "value";

export type NaturalTypes = "B" | "C" | "D" | "E" | "F" | "G" | "A";

export type SharpTypes = "C♯" | "D♯" | "F♯" | "G♯" | "A♯" | NaturalTypes;

export type FlatTypes = "D♭" | "E♭" | "G♭" | "A♭" | "B♭" | NaturalTypes;

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

export type KeyControlTypes =
    | "INCREMENT_POSITION_X"
    | "DECREMENT_POSITION_X"
    | "INCREMENT_POSITION_Y"
    | "DECREMENT_POSITION_Y";

export type ArrowTypes = "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight";

export type DiffType = { [key in number]: number };

export interface FretboardUtilType {
    notes: NoteSwitchType;
    strings: StringSwitchType;
}

export type BrushTypes = "highlight" | "select" | "erase";

export type ChordTypes =
    | "maj"
    | "m"
    | "aug"
    | "dim"
    | "sus"
    | "maj7"
    | "min7"
    | "7"
    | "min7♭5"
    | "dim♭♭7"
    | "penta"
    | "Dim Penta"
    | "Major"
    | "Mel min"
    | "Har Maj"
    | "Har Min"
    | "Neo";
