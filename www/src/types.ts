export type numString = number | string;

export type LabelTypes = "sharp" | "flat" | "value";

export type NaturalTypes = "B" | "C" | "D" | "E" | "F" | "G" | "A";

export type SharpTypes =
    | "C__♯__"
    | "D__♯__"
    | "F__♯__"
    | "G__♯__"
    | "A__♯__"
    | NaturalTypes;

export type FlatTypes =
    | "D__♭__"
    | "E__♭__"
    | "G__♭__"
    | "A__♭__"
    | "B__♭__"
    | NaturalTypes;

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

export type BrushTypes = "highlight" | "select" | "erase";

export type ChordTypes =
    | "maj"
    | "min"
    | "aug"
    | "dim"
    | "sus"
    | "maj__7"
    | "min__7"
    | "__7"
    | "min__7♭5"
    | "dim__♭♭7"
    | "pentatonic"
    | "dim. pentatonic"
    | "Major"
    | "Melodic Minor"
    | "Harmonic Major"
    | "Harmonic Minor"
    | "Neopolitan";
