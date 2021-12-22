export type LabelTypes = "sharp" | "flat" | "value";

export type NaturalTypes = "B" | "C" | "D" | "E" | "F" | "G" | "A";

export type SharpTypes = "C♯" | "D♯" | "F♯" | "G♯" | "A♯" | NaturalTypes;

export type FlatTypes = "D♭" | "E♭" | "G♭" | "A♭" | "B♭" | NaturalTypes;

export type NoteTypes = NaturalTypes | SharpTypes | FlatTypes;

export type NoteSwitchType = [
    StatusTypes,
    StatusTypes,
    StatusTypes,
    StatusTypes,
    StatusTypes,
    StatusTypes,
    StatusTypes,
    StatusTypes,
    StatusTypes,
    StatusTypes,
    StatusTypes,
    StatusTypes
];

export type FretSwitchType = {
    [key: number]: StatusTypes;
};

export type StringSwitchType = [
    FretSwitchType,
    FretSwitchType,
    FretSwitchType,
    FretSwitchType,
    FretSwitchType,
    FretSwitchType
];

export type ArrowTypes = "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight";

export type DiffType = { [key in number]: number };

export type StatusTypes = 0 | 1 | 2;
export type HighlightTypes = "erase" | "select" | "highlight";

export type StrumTypes =
    | "strumLowToHigh"
    | "strumHighToLow"
    | "arpeggiateLowToHigh"
    | "arpeggiateHighToLow";

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
