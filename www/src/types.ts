export type numString = number | string;

export type LabelTypes = "sharp" | "flat" | "value";

export type NaturalTypes = "B" | "C" | "D" | "E" | "F" | "G" | "A";

export type SharpTypes = "C♯" | "D♯" | "F♯" | "G♯" | "A♯" | NaturalTypes;

export type FlatTypes = "D♭" | "E♭" | "G♭" | "A♭" | "B♭" | NaturalTypes;

export type NoteTypes = NaturalTypes | SharpTypes | FlatTypes;

export type NoteSwitchType = {
    [key: number]: number;
};

export type StringSwitchType = [
    NoteSwitchType,
    NoteSwitchType,
    NoteSwitchType,
    NoteSwitchType,
    NoteSwitchType,
    NoteSwitchType
];

export type ArrowTypes = "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight";

export type DiffType = { [key in number]: number };

export type BrushModes = 0 | 1 | 2;
export type BrushTypes = "erase" | "select" | "highlight";

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

export interface ProgressionStateType {
    fretboards: StringSwitchType[];
    leftDiffs: DiffType[];
    rightDiffs: DiffType[];
    focusedIndex: number;
    scrollToFret: number;
    label: LabelTypes;
    hiddenFretboardIndices: number[];
}

export interface StateType {
    progressions: ProgressionStateType[];
    invert?: boolean;
    leftHand?: boolean;
    brushMode: BrushModes;
    showInput: boolean;
    currentProgressionIndex: number;
}

export interface SliderStateType {
    progress: number;
}
