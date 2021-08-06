import {
    SharpTypes,
    FlatTypes,
    NoteTypes,
    NoteSwitchType,
    StringSwitchType,
    NaturalTypes,
} from "../types";

export const C = "C";
export const Cs = "C#";
export const Db = "Db";
export const D = "D";
export const Ds = "D#";
export const Eb = "Eb";
export const E = "E";
export const F = "F";
export const Fs = "F#";
export const Gb = "Gb";
export const G = "G";
export const Gs = "G#";
export const Ab = "Ab";
export const A = "A";
export const As = "A#";
export const Bb = "Bb";
export const B = "B";

export const DEFAULT_NOTESWITCH: NoteSwitchType = {
    0: false,
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
    8: false,
    9: false,
    10: false,
    11: false,
};

export const DEFAULT_STRINGSWITCH: StringSwitchType = [{}, {}, {}, {}, {}, {}];

export const NOTE_NAMES: Array<[SharpTypes, FlatTypes]> = [
    [C, C],
    [Cs, Db],
    [D, D],
    [Ds, Eb],
    [E, E],
    [F, F],
    [Fs, Gb],
    [G, G],
    [Gs, Ab],
    [A, A],
    [As, Bb],
    [B, B],
];

export const SHARP_NAMES: SharpTypes[] = NOTE_NAMES.map((names) => names[0]);
export const FLAT_NAMES: FlatTypes[] = NOTE_NAMES.map((names) => names[1]);
export const NOTE_VALUES: { [key in NoteTypes]?: number } = {};
NOTE_NAMES.forEach((names, i) => {
    NOTE_VALUES[names[0]] = i;
    NOTE_VALUES[names[1]] = i;
});

// C0 = 0 in this system. Lowest string on guitar is E2 = 28
export const STANDARD_TUNING = [28, 33, 38, 43, 47, 52];

export const FRETBOARD_WIDTH = 1700;

export const STRING_SIZE = 22;

export const CIRCLE_SIZE = 26;

export const NATURAL_NOTE_NAMES: NaturalTypes[] = [C, D, E, F, G, A, B];
