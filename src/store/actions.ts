import { LabelTypes, ModeTypes } from "../types";

export type SetNote = {
    readonly type: "SET_NOTE";
    readonly payload: number;
};

export type SetMode = {
    readonly type: "SET_MODE";
    readonly payload: ModeTypes;
};

export type SetLabel = {
    readonly type: "SET_LABEL";
    readonly payload: LabelTypes;
};

export type IncrementPosition = {
    readonly type: "INCREMENT_POSITION";
};

export type DecrementPosition = {
    readonly type: "DECREMENT_POSITION";
};

export type ClearNotes = {
    readonly type: "CLEAR";
};

export type InvertFretboard = {
    readonly type: "INVERT";
};

export type setHighlightedNote = {
    readonly type: "SET_HIGHLIGHTED_NOTE";
    readonly payload: {
        stringIndex: number;
        value: number;
    };
};

export type ActionTypes =
    | SetNote
    | SetMode
    | SetLabel
    | ClearNotes
    | IncrementPosition
    | DecrementPosition
    | setHighlightedNote
    | InvertFretboard;
