import { BrushTypes, LabelTypes } from "../types";
import { StateType } from "./state";

export type SetProgression = {
    readonly type: "SET_PROGRESSION";
    readonly payload: {
        currentProgressionIndex: number;
    };
};

export type SetNote = {
    readonly type: "SET_NOTE";
    readonly payload: {
        note: number;
        turnOn?: boolean;
    };
};

export type SetNotes = {
    readonly type: "SET_NOTES";
    readonly payload: {
        notes: number[];
    };
};

export type SetLabel = {
    readonly type: "SET_LABEL";
    readonly payload: {
        label: LabelTypes;
    };
};

export type IncrementPositionX = {
    readonly type: "INCREMENT_POSITION_X";
};

export type DecrementPositionX = {
    readonly type: "DECREMENT_POSITION_X";
};

export type IncrementPositionY = {
    readonly type: "INCREMENT_POSITION_Y";
};

export type DecrementPositionY = {
    readonly type: "DECREMENT_POSITION_Y";
};

export type ClearAllNotes = {
    readonly type: "CLEAR_ALL";
};

export type ClearNotes = {
    readonly type: "CLEAR";
    readonly payload: {
        focusedIndex: number;
    };
};

export type InvertFretboard = {
    readonly type: "INVERT";
};

export type LeftHandFretboard = {
    readonly type: "LEFT_HAND";
};

export type SetHighlightedNote = {
    readonly type: "SET_HIGHLIGHTED_NOTE";
    readonly payload: {
        stringIndex: number;
        value: number;
        turnOn?: boolean;
    };
};

export type AddFretboard = {
    readonly type: "ADD_FRETBOARD";
};

export type RemoveFretboard = {
    readonly type: "REMOVE_FRETBOARD";
};

export type SetFocus = {
    readonly type: "SET_FOCUS";
    readonly payload: {
        focusedIndex: number;
    };
};

export type SetShowInput = {
    readonly type: "SET_SHOW_INPUT";
    readonly payload: {
        showInput: boolean;
    };
};

export type SetBrushMode = {
    readonly type: "SET_BRUSH_MODE";
    readonly payload: {
        brushMode: BrushTypes;
    };
};

export type RehydrateState = {
    readonly type: "REHYDRATE";
    readonly payload: StateType;
};

export type ActionTypes =
    | SetProgression
    | SetNote
    | SetNotes
    | SetLabel
    | ClearAllNotes
    | ClearNotes
    | IncrementPositionX
    | DecrementPositionX
    | IncrementPositionY
    | DecrementPositionY
    | SetHighlightedNote
    | InvertFretboard
    | LeftHandFretboard
    | AddFretboard
    | RemoveFretboard
    | SetFocus
    | SetShowInput
    | SetBrushMode
    | RehydrateState;
