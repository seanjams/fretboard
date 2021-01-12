import { ActionTypes } from "./actions";
import { StateType } from "./state";
import { FretboardUtil } from "../utils";

function NeverCalled(never: never): void {}

export function reducer(state: StateType, action: ActionTypes): StateType {
	const fretboards = state.fretboards;
	if (action.type === "CLEAR") {
		const fretboards = Array(state.fretboards.length).fill(0).map(() => new FretboardUtil())
		return { ...state, fretboards };
	}

	if (action.type === "INVERT") {
		return { ...state, invert: !state.invert };
	}

	if (action.type === "SET_NOTE") {
		const { fretboardIndex, note } = action.payload;
		const fretboard = fretboards[fretboardIndex].copy();
		fretboard.toggle(note);
		fretboards[fretboardIndex] = fretboard;
		return { ...state, fretboards };
	}

	if (action.type === "SET_LABEL") {
		const { label } = action.payload;
		return { ...state, label };
	}

	if (action.type === "INCREMENT_POSITION") {
		const { fretboardIndex } = action.payload;
		const fretboard = fretboards[fretboardIndex].copy();
		fretboard.incrementPosition(1);
		fretboards[fretboardIndex] = fretboard;
		return { ...state, fretboards };
	}

	if (action.type === "DECREMENT_POSITION") {
		const { fretboardIndex } = action.payload;
		const fretboard = fretboards[fretboardIndex].copy();
		fretboard.incrementPosition(-1);
		fretboards[fretboardIndex] = fretboard;
		return { ...state, fretboards };
	}

	if (action.type === "SET_HIGHLIGHTED_NOTE") {
		const { fretboardIndex, stringIndex, value } = action.payload;
		const fretboard = fretboards[fretboardIndex].copy();
		fretboard.toggleFret(stringIndex, value);
		fretboards[fretboardIndex] = fretboard;
		return { ...state, fretboards };
	}

	if (action.type === "ADD_FRETBOARD") {

		fretboards.push(new FretboardUtil());
		return { ...state, fretboards };
	}

	if (action.type === "REMOVE_FRETBOARD") {
		if (fretboards.length > 1) fretboards.pop();
		return { ...state, fretboards };
	}

	if (action.type === "SET_FOCUS") {
		const { fretboardIndex } = action.payload;
		return { ...state, focusedIndex: fretboardIndex };
	}

	NeverCalled(action);	
}
