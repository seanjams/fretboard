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

export type StringSwitchType = [
    StatusTypes[],
    StatusTypes[],
    StatusTypes[],
    StatusTypes[],
    StatusTypes[],
    StatusTypes[]
];

export type FretboardNameType = {
    rootIdx: number;
    rootName: NoteTypes | "";
    chordName: string;
    foundChordName: ChordTypes | "";
    isSelected: boolean;
};

export interface FretboardType {
    strings: StringSwitchType;
    names: FretboardNameType[];
    currentRootIndex: number;
}

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
    | "maj__6"
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

export type DragStatusTypes = "on" | "off" | null;

export type DisplayTypes =
    | "normal"
    | "chord-input"
    | "settings"
    | "change-name";
