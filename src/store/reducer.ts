import { ActionTypes } from "./actions";
import { StateType } from "./state";
import { FretboardUtil } from "../utils";

export function reducer(state: StateType, action: ActionTypes): StateType {
    let fretboard;
    switch (action.type) {
        case "CLEAR":
            return { ...state, fretboard: new FretboardUtil() };
        case "INVERT":
            return { ...state, invert: !state.invert };
        case "SET_NOTE":
            fretboard = state.fretboard.copy();
            fretboard.toggle(action.payload);
            return { ...state, fretboard };
        case "SET_MODE":
            return { ...state, mode: action.payload };
        case "SET_LABEL":
            return { ...state, label: action.payload };
        case "INCREMENT_POSITION":
            fretboard = state.fretboard.copy();
            fretboard.incrementPosition(1);
            return { ...state, fretboard };
        case "DECREMENT_POSITION":
            fretboard = state.fretboard.copy();
            fretboard.incrementPosition(-1);
            return { ...state, fretboard };
        case "SET_HIGHLIGHTED_NOTE":
            const { stringIndex, value } = action.payload;
            fretboard = state.fretboard.copy();
            fretboard.toggleFret(stringIndex, value);
            return { ...state, fretboard };
        default:
            NeverCalled(action);
    }
}

function NeverCalled(never: never): void {}
