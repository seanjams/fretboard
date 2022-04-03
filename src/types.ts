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
    | "aug"
    | "maj__6"
    | "maj__7"
    | "maj__7♯11"
    | "aug__7"
    | "min"
    | "min__7"
    | "minmaj__7"
    | "min__7♭5"
    | "min__9"
    | "min__11"
    | "min__6"
    | "dim"
    | "dim__♭♭7"
    | "sus2"
    | "sus4"
    | "7"
    | "9"
    | "7__♭9"
    | "7__♯9"
    | "7__♯11"
    | "11"
    | "7__♭5"
    | "7__♭13"
    | "13"
    | "sus7"
    | "pentatonic"
    | "dim. pentatonic"
    | "Wholetone"
    | "Major"
    | "Mel. Minor"
    | "Harm. Major"
    | "Harm. Minor"
    | "Hungarian"
    | "Neopolitan"
    | "Symmetric Dim."
    | "Chromatic";

export type DragStatusTypes = "on" | "off" | null;

export type DisplayTypes =
    | "normal"
    | "change-chord"
    | "settings"
    | "change-inversion"
    | "change-progression";

export type ReactMouseEvent =
    | React.MouseEvent<HTMLDivElement, MouseEvent>
    | React.TouchEvent<HTMLDivElement>;

export type WindowMouseEvent = MouseEvent | TouchEvent;
