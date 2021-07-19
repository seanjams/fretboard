import { LabelTypes } from "../types";
import { StateType } from "./state";

export type SetNote = {
    readonly type: "SET_NOTE";
    readonly payload: {
        note: number;
        turnOn?: boolean;
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

export type ClearNotes = {
    readonly type: "CLEAR";
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
        fretboardIndex: number;
    };
};

export type RehydrateState = {
    readonly type: "REHYDRATE";
    readonly payload: StateType;
};

export type ActionTypes =
    | SetNote
    | SetLabel
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
    | RehydrateState;
