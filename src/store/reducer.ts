import { ActionTypes } from "./actions";
import { StateType, rebuildDiffs } from "./state";
import { FretboardUtil } from "../utils";

function NeverCalled(never: never): void {}

export function reducer(state: StateType, action: ActionTypes): StateType {
	let fretboards = state.fretboards;

	if (action.type === "CLEAR") {
		const newFretboards = Array(fretboards.length)
			.fill(0)
			.map(() => new FretboardUtil());
		return { ...state, ...rebuildDiffs(newFretboards) };
	}

	if (action.type === "INVERT") {
		return { ...state, invert: !state.invert };
	}

	if (action.type === "LEFT_HAND") {
		return { ...state, leftHand: !state.leftHand };
	}

	if (action.type === "SET_NOTE") {
		const { fretboardIndex, note } = action.payload;
		const fretboard = fretboards[fretboardIndex].copy();
		fretboard.toggle(note);
		fretboards[fretboardIndex] = fretboard;

		return { ...state, ...rebuildDiffs(fretboards) };
	}

	if (action.type === "SET_LABEL") {
		const { label } = action.payload;
		return { ...state, label };
	}

	if (action.type === "INCREMENT_POSITION_X") {
		const { fretboardIndex } = action.payload;
		const fretboard = fretboards[fretboardIndex].copy();
		fretboard.incrementPosition(1, false);
		fretboards[fretboardIndex] = fretboard;
		return { ...state, ...rebuildDiffs(fretboards) };
	}

	if (action.type === "DECREMENT_POSITION_X") {
		const { fretboardIndex } = action.payload;
		const fretboard = fretboards[fretboardIndex].copy();
		fretboard.incrementPosition(-1, false);
		fretboards[fretboardIndex] = fretboard;
		return { ...state, ...rebuildDiffs(fretboards) };
	}

	if (action.type === "INCREMENT_POSITION_Y") {
		let { focusedIndex } = state;
		const { fretboardIndex } = action.payload;
		const fretboard = fretboards[fretboardIndex].copy();
		const valid = fretboard.incrementPosition(1, true);
		if (!valid) {
			if (state.invert !== state.leftHand) {
				if (focusedIndex < fretboards.length - 1) focusedIndex++;
			} else {
				if (0 < focusedIndex) focusedIndex--;
			}
		}
		fretboards[fretboardIndex] = fretboard;
		return { ...state, focusedIndex, ...rebuildDiffs(fretboards) };
	}

	if (action.type === "DECREMENT_POSITION_Y") {
		let { focusedIndex } = state;
		const { fretboardIndex } = action.payload;
		const fretboard = fretboards[fretboardIndex].copy();
		const valid = fretboard.incrementPosition(-1, true);
		if (!valid) {
			if (state.invert !== state.leftHand) {
				if (0 < focusedIndex) focusedIndex--;
			} else {
				if (focusedIndex < fretboards.length - 1) focusedIndex++;
			}
		}
		fretboards[fretboardIndex] = fretboard;
		return { ...state, focusedIndex, ...rebuildDiffs(fretboards) };
	}

	if (action.type === "SET_HIGHLIGHTED_NOTE") {
		const { fretboardIndex, stringIndex, value } = action.payload;
		const fretboard = fretboards[fretboardIndex].copy();
		fretboard.toggleFret(stringIndex, value);
		fretboards[fretboardIndex] = fretboard;
		return { ...state, ...rebuildDiffs(fretboards) };
	}

	if (action.type === "ADD_FRETBOARD") {
		const lastFretboard = fretboards[fretboards.length - 1].copy();
		fretboards.push(lastFretboard);
		return { ...state, ...rebuildDiffs(fretboards) };
	}

	if (action.type === "REMOVE_FRETBOARD") {
		let { focusedIndex } = state;
		if (fretboards.length > 1) fretboards.pop();
		if (focusedIndex >= fretboards.length)
			focusedIndex = fretboards.length - 1;

		return { ...state, focusedIndex, ...rebuildDiffs(fretboards) };
	}

	if (action.type === "SET_FOCUS") {
		const { fretboardIndex } = action.payload;
		return { ...state, focusedIndex: fretboardIndex };
	}

	if (action.type === "REHYDRATE") {
		return {
			...action.payload,
		};
	}

	if (action.type === "SAVE_TO_LOCAL_STORAGE") {
		let key: keyof StateType;
		let value: any;
		for (key in state) {
			value = JSON.stringify(
				key === "fretboards"
					? state[key].map((fretboard) => fretboard.toJSON())
					: state[key]
			);
			localStorage.setItem(key, value);
		}
		return state;
	}

	NeverCalled(action);
}
