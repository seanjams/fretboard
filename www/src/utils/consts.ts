import {
    SharpTypes,
    FlatTypes,
    NoteTypes,
    NoteSwitchType,
    StringSwitchType,
    NaturalTypes,
    ChordTypes,
} from "../types";

export const C = "C";
export const Cs = "C♯";
export const Db = "D♭";
export const D = "D";
export const Ds = "D♯";
export const Eb = "E♭";
export const E = "E";
export const F = "F";
export const Fs = "F♯";
export const Gb = "G♭";
export const G = "G";
export const Gs = "G♯";
export const Ab = "A♭";
export const A = "A";
export const As = "A♯";
export const Bb = "B♭";
export const B = "B";

export function DEFAULT_NOTESWITCH(): NoteSwitchType {
    return {
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
}

export function DEFAULT_STRINGSWITCH(): StringSwitchType {
    return [{}, {}, {}, {}, {}, {}];
}

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
const SP = [4, 8, 12, 16, 20, 24, 30, 32];

export const STANDARD_TUNING = [28, 33, 38, 43, 47, 52];

export const FRETBOARD_WIDTH = 1700;

// export const FRETBOARD_HEIGHT = 250;

export const FRETBOARD_MARGIN_HEIGHT = SP[1];

export const STRING_SIZE = 22;

export const CIRCLE_SIZE = 26;

export const SAFETY_AREA_HEIGHT = SP[1];

export const SLIDER_LEFT_WINDOW = 0.25;

export const SLIDER_RIGHT_WINDOW = 1 - SLIDER_LEFT_WINDOW;

export const SLIDER_WINDOW_LENGTH =
    1 + SLIDER_LEFT_WINDOW - SLIDER_RIGHT_WINDOW;

export const NATURAL_NOTE_NAMES: NaturalTypes[] = [C, D, E, F, G, A, B];

export const majorChord = "maj";
export const minorChord = "min";
export const augChord = "aug";
export const dimChord = "dim";
export const susChord = "sus";
export const maj7Chord = "maj__7";
export const min7Chord = "min__7";
export const domChord = "__7";
export const min7b5Chord = "min__7♭5";
export const dim7Chord = "dim__♭♭7";
export const pentaScale = "pentatonic";
export const dimPentaScale = "dim. pentatonic";
export const majorScale = "Major";
export const melMinScale = "Melodic Minor";
export const harMajScale = "Harmonic Major";
export const harMinScale = "Harmonic Minor";
export const NeoScale = "Neopolitan";

export const CHORD_NAMES: ChordTypes[] = [
    majorChord,
    minorChord,
    augChord,
    dimChord,
    susChord,
    maj7Chord,
    min7Chord,
    domChord,
    min7b5Chord,
    dim7Chord,
    pentaScale,
    dimPentaScale,
    majorScale,
    melMinScale,
    harMajScale,
    harMinScale,
    NeoScale,
];

export const SHAPES: { [key in ChordTypes]: number[] } = {
    [majorChord]: [0, 4, 7],
    [minorChord]: [0, 3, 7],
    [augChord]: [0, 4, 8],
    [dimChord]: [0, 3, 6],
    [susChord]: [0, 2, 7],
    [maj7Chord]: [0, 4, 7, 11],
    [min7Chord]: [0, 3, 7, 10],
    [domChord]: [0, 4, 7, 10],
    [min7b5Chord]: [0, 3, 6, 10],
    [dim7Chord]: [0, 3, 6, 9],
    [pentaScale]: [0, 2, 4, 7, 9],
    [dimPentaScale]: [0, 3, 6, 8, 10],
    [majorScale]: [0, 2, 4, 5, 7, 9, 11],
    [melMinScale]: [0, 2, 3, 5, 7, 9, 11],
    [harMajScale]: [0, 2, 4, 5, 7, 8, 11],
    [harMinScale]: [0, 2, 3, 5, 7, 8, 11],
    [NeoScale]: [0, 1, 3, 5, 7, 9, 11],
};
