import {
    SharpTypes,
    FlatTypes,
    NoteTypes,
    NoteSwitchType,
    StringSwitchType,
    NaturalTypes,
    ChordTypes,
    StatusTypes,
    HighlightTypes,
    LabelTypes,
    FretboardNameType,
    FretboardType,
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

export const NOT_SELECTED = 0;
export const SELECTED = 1;
export const HIGHLIGHTED = 2;

export const STATUSES: StatusTypes[] = [NOT_SELECTED, SELECTED, HIGHLIGHTED];

export function DEFAULT_NOTESWITCH(): NoteSwitchType {
    return [
        NOT_SELECTED,
        NOT_SELECTED,
        NOT_SELECTED,
        NOT_SELECTED,
        NOT_SELECTED,
        NOT_SELECTED,
        NOT_SELECTED,
        NOT_SELECTED,
        NOT_SELECTED,
        NOT_SELECTED,
        NOT_SELECTED,
        NOT_SELECTED,
    ];
}

export function DEFAULT_STRINGSWITCH(): StringSwitchType {
    const fretboard: StringSwitchType = [[], [], [], [], [], []];
    for (let i = 0; i < STRING_SIZE; i++) {
        fretboard[0][i] = NOT_SELECTED;
        fretboard[1][i] = NOT_SELECTED;
        fretboard[2][i] = NOT_SELECTED;
        fretboard[3][i] = NOT_SELECTED;
        fretboard[4][i] = NOT_SELECTED;
        fretboard[5][i] = NOT_SELECTED;
    }
    return fretboard;
}

export function DEFAULT_FRETBOARD_NAME(): FretboardNameType {
    return {
        rootIdx: -1,
        rootName: "",
        chordName: "",
        foundChordName: "",
        isSelected: true,
    };
}

export function DEFAULT_FRETBOARD(): FretboardType {
    const strings = DEFAULT_STRINGSWITCH();
    const names = [DEFAULT_FRETBOARD_NAME()];
    return {
        strings,
        names,
        currentRootIndex: names[0].rootIdx,
    };
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

export const NATURAL_NOTE_NAMES: NaturalTypes[] = [C, D, E, F, G, A, B];
export const SHARP_NAMES: SharpTypes[] = NOTE_NAMES.map((names) => names[0]);
export const FLAT_NAMES: FlatTypes[] = NOTE_NAMES.map((names) => names[1]);
export const NOTE_VALUES: { [key in NoteTypes]?: number } = {};
NOTE_NAMES.forEach((names, i) => {
    NOTE_VALUES[names[0]] = i;
    NOTE_VALUES[names[1]] = i;
});

function getNaturalNotesKeyMap(label: LabelTypes) {
    let naturals: { [key in string]: number } = {};
    let i = 0;
    for (let name of NATURAL_NOTE_NAMES) {
        if (label === "flat") {
            naturals[name] = i;
            if (name !== F && name !== C) i++;
            naturals[name.toLowerCase()] = i;
            i++;
        } else if (label === "sharp") {
            naturals[name.toLowerCase()] = i;
            if (name !== E && name !== B) i++;
            naturals[name] = i;
            i++;
        }
    }

    return naturals;
}

export const NATURAL_NOTE_KEYMAP: {
    [key in LabelTypes]: ReturnType<typeof getNaturalNotesKeyMap>;
} = {
    value: getNaturalNotesKeyMap("flat"),
    flat: getNaturalNotesKeyMap("flat"),
    sharp: getNaturalNotesKeyMap("sharp"),
};

// C0 = 0 in this system. Lowest string on guitar is E2 = 28
export const SP = [4, 8, 12, 16, 20, 24, 30, 32];

export const STANDARD_TUNING = [28, 33, 38, 43, 47, 52];

export const FRETBOARD_WIDTH = 1700;

export const FRETBOARD_MARGIN = SP[4];

export const STRING_SIZE = 23;

export const CIRCLE_SIZE = 26;

export const SAFETY_AREA_MARGIN = SP[7];

export const SLIDER_LEFT_WINDOW = 0.25;

export const SLIDER_RIGHT_WINDOW = 1 - SLIDER_LEFT_WINDOW;

export const SLIDER_WINDOW_LENGTH =
    1 + SLIDER_LEFT_WINDOW - SLIDER_RIGHT_WINDOW;

// major chords
export const majorChord = "maj";
export const augChord = "aug";
export const maj6Chord = "maj__6";
export const maj7Chord = "maj__7";
export const maj7s11Chord = "maj__7♯11";
export const aug7Chord = "aug__7";

// minor chords
export const minorChord = "min";
export const min7Chord = "min__7";
export const minmaj7Chord = "minmaj__7";
export const min7b5Chord = "min__7♭5";
export const min9Chord = "min__9";
export const min11Chord = "min__11";

// diminished chords
export const dimChord = "dim";
export const dim7Chord = "dim__♭♭7";

// suspended chords
export const sus2Chord = "sus2";
export const sus4Chord = "sus4";

// dominant chords
export const domChord = "7";
export const dom9Chord = "9";
export const domb9Chord = "7__♭9";
export const doms9Chord = "7__♯9";
export const doms11Chord = "7__♯11";
export const dom11Chord = "11";
export const domb5Chord = "7__♭5";
export const domb13Chord = "7__♭13";
export const dom13Chord = "13";
export const domsusChord = "sus7";

// scales
export const pentaScale = "pentatonic";
export const dimPentaScale = "dim. pentatonic";
export const WholeToneScale = "Wholetone";
export const majorScale = "Major";
export const melMinScale = "Mel. Minor";
export const harMajScale = "Harm. Major";
export const harMinScale = "Harm. Minor";
export const Hungarian = "Hungarian";
export const NeoScale = "Neopolitan";
export const SymDimScale = "Symmetric Dim.";
export const ChromaticScale = "Chromatic";

export const CHORD_NAMES: ChordTypes[] = [
    majorChord,
    augChord,
    maj6Chord,
    maj7Chord,
    aug7Chord,
    maj7s11Chord,
    minorChord,
    min7Chord,
    minmaj7Chord,
    min9Chord,
    min11Chord,
    min7b5Chord,
    dimChord,
    dim7Chord,
    sus2Chord,
    sus4Chord,
    domChord,
    dom9Chord,
    domb9Chord,
    doms9Chord,
    doms11Chord,
    dom11Chord,
    domb5Chord,
    domb13Chord,
    dom13Chord,
    domsusChord,
    pentaScale,
    dimPentaScale,
    WholeToneScale,
    majorScale,
    melMinScale,
    harMajScale,
    harMinScale,
    Hungarian,
    NeoScale,
    SymDimScale,
    ChromaticScale,
];

export const SHAPES: { label: ChordTypes; shapes: number[][] }[] = [
    // major chords
    { label: majorChord, shapes: [[0, 4, 7]] },
    { label: augChord, shapes: [[0, 4, 8]] },
    {
        label: maj6Chord,
        shapes: [
            [0, 4, 7, 9],
            [0, 4, 9],
        ],
    },
    {
        label: maj7Chord,
        shapes: [
            [0, 4, 7, 11],
            [0, 4, 11],
        ],
    },
    { label: aug7Chord, shapes: [[0, 4, 8, 11]] },
    {
        label: maj7s11Chord,
        shapes: [
            [0, 4, 6, 11],
            [0, 4, 6, 7, 11],
        ],
    },

    // minor chords
    { label: minorChord, shapes: [[0, 3, 7]] },
    {
        label: min7Chord,
        shapes: [
            [0, 3, 7, 10],
            [0, 3, 10],
        ],
    },
    {
        label: minmaj7Chord,
        shapes: [
            [0, 3, 7, 11],
            [0, 3, 11],
        ],
    },

    {
        label: min9Chord,
        shapes: [
            [0, 2, 3, 10],
            [0, 2, 3, 7, 10],
        ],
    },
    {
        label: min11Chord,
        shapes: [
            [0, 3, 5, 10],
            [0, 3, 5, 7, 10],
        ],
    },

    { label: min7b5Chord, shapes: [[0, 3, 6, 10]] },

    // diminished chords
    { label: dimChord, shapes: [[0, 3, 6]] },
    { label: dim7Chord, shapes: [[0, 3, 6, 9]] },

    // sus chords
    { label: sus2Chord, shapes: [[0, 2, 7]] },
    { label: sus4Chord, shapes: [[0, 5, 7]] },

    // dominant chords
    {
        label: domChord,
        shapes: [
            [0, 4, 7, 10],
            [0, 4, 10],
        ],
    },
    {
        label: dom9Chord,
        shapes: [
            [0, 2, 4, 10],
            [0, 2, 4, 7, 10],
        ],
    },
    {
        label: domb9Chord,
        shapes: [
            [0, 1, 4, 10],
            [0, 1, 4, 7, 10],
        ],
    },
    {
        label: doms9Chord,
        shapes: [
            [0, 3, 4, 10],
            [0, 3, 4, 7, 10],
        ],
    },
    {
        label: dom11Chord,
        shapes: [
            [0, 4, 5, 10],
            [0, 4, 5, 7, 10],
        ],
    },
    {
        label: doms11Chord,
        shapes: [
            [0, 4, 6, 10],
            [0, 4, 6, 7, 10],
        ],
    },
    { label: domb5Chord, shapes: [[0, 4, 6, 10]] },
    {
        label: domb13Chord,
        shapes: [
            [0, 4, 8, 10],
            [0, 4, 7, 8, 10],
        ],
    },
    {
        label: dom13Chord,
        shapes: [
            [0, 4, 9, 10],
            [0, 4, 7, 9, 10],
        ],
    },
    { label: domsusChord, shapes: [[0, 5, 7, 10]] },

    // Scales
    { label: pentaScale, shapes: [[0, 2, 4, 7, 9]] },
    { label: dimPentaScale, shapes: [[0, 3, 6, 8, 10]] },
    { label: WholeToneScale, shapes: [[0, 2, 4, 6, 8, 10]] },
    { label: majorScale, shapes: [[0, 2, 4, 5, 7, 9, 11]] },
    { label: melMinScale, shapes: [[0, 2, 3, 5, 7, 9, 11]] },
    { label: harMajScale, shapes: [[0, 2, 4, 5, 7, 8, 11]] },
    { label: harMinScale, shapes: [[0, 2, 3, 5, 7, 8, 11]] },
    { label: Hungarian, shapes: [[0, 2, 3, 6, 7, 8, 11]] },
    { label: NeoScale, shapes: [[0, 1, 3, 5, 7, 9, 11]] },
    { label: SymDimScale, shapes: [[0, 1, 3, 4, 6, 7, 9, 10]] },
    { label: ChromaticScale, shapes: [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]] },
];

export const BRUSH_MODES: {
    [key in StatusTypes]: HighlightTypes;
} = {
    [NOT_SELECTED]: "erase",
    [SELECTED]: "select",
    [HIGHLIGHTED]: "highlight",
};

export const STRUM_LOW_TO_HIGH = "strumLowToHigh";
export const STRUM_HIGH_TO_LOW = "strumHighToLow";
export const ARPEGGIATE_LOW_TO_HIGH = "arpeggiateLowToHigh";
export const ARPEGGIATE_HIGH_TO_LOW = "arpeggiateHighToLow";
