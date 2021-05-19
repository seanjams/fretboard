import { ActionTypes } from "./actions";
import { StateType, rebuildDiffs } from "./state";
import { FretboardUtil } from "../utils";

function NeverCalled(never: never): void {}

export function reducer(state: StateType, action: ActionTypes): StateType {
	let { fretboards, focusedIndex } = state;

	if (action.type === "CLEAR") {
		const newFretboards = Array(fretboards.length)
			.fill(0)
			.map(() => new FretboardUtil());
		return {
			...state,
			...rebuildDiffs(newFretboards, state.lockHighlight),
		};
	}

	if (action.type === "INVERT") {
		return { ...state, invert: !state.invert };
	}

	if (action.type === "LEFT_HAND") {
		return { ...state, leftHand: !state.leftHand };
	}

	if (action.type === "LOCK_HIGHLIGHT") {
		return { ...state, lockHighlight: !state.lockHighlight };
	}

	if (action.type === "SET_NOTE") {
		const { note } = action.payload;
		const fretboard = fretboards[focusedIndex].copy();
		fretboard.toggle(note);
		fretboards[focusedIndex] = fretboard;

		return { ...state, ...rebuildDiffs(fretboards, state.lockHighlight) };
	}

	if (action.type === "SET_LABEL") {
		const { label } = action.payload;
		return { ...state, label };
	}

	if (action.type === "INCREMENT_POSITION_X") {
		for (let index in fretboards) {
			if (!state.lockHighlight && +index !== focusedIndex) continue;
			const fretboard = fretboards[index].copy();
			fretboard.incrementPosition(1, false);
			fretboards[index] = fretboard;
		}
		return {
			...state,
			...rebuildDiffs(fretboards, state.lockHighlight),
		};
	}

	if (action.type === "DECREMENT_POSITION_X") {
		for (let index in fretboards) {
			if (!state.lockHighlight && +index !== focusedIndex) continue;
			const fretboard = fretboards[index].copy();
			fretboard.incrementPosition(-1, false);
			fretboards[index] = fretboard;
		}
		return {
			...state,
			...rebuildDiffs(fretboards, state.lockHighlight),
		};
	}

	if (action.type === "INCREMENT_POSITION_Y") {
		for (let index in fretboards) {
			if (!state.lockHighlight && +index !== focusedIndex) continue;
			const fretboard = fretboards[index].copy();
			fretboard.incrementPosition(1, true);
			fretboards[index] = fretboard;
		}
		return {
			...state,
			...rebuildDiffs(fretboards, state.lockHighlight),
		};
	}

	if (action.type === "DECREMENT_POSITION_Y") {
		for (let index in fretboards) {
			if (!state.lockHighlight && +index !== focusedIndex) continue;
			const fretboard = fretboards[index].copy();
			fretboard.incrementPosition(-1, true);
			fretboards[index] = fretboard;
		}
		return {
			...state,
			...rebuildDiffs(fretboards, state.lockHighlight),
		};
	}

	if (action.type === "SET_HIGHLIGHTED_NOTE") {
		const { stringIndex, value } = action.payload;
		const fretboard = fretboards[focusedIndex].copy();
		fretboard.toggleFret(stringIndex, value);
		fretboards[focusedIndex] = fretboard;
		return { ...state, ...rebuildDiffs(fretboards, state.lockHighlight) };
	}

	if (action.type === "ADD_FRETBOARD") {
		const lastFretboard = fretboards[fretboards.length - 1].copy();
		fretboards.push(lastFretboard);
		return { ...state, ...rebuildDiffs(fretboards, state.lockHighlight) };
	}

	if (action.type === "REMOVE_FRETBOARD") {
		let { focusedIndex, lockHighlight } = state;
		if (fretboards.length > 1) fretboards.pop();
		if (focusedIndex >= fretboards.length)
			focusedIndex = fretboards.length - 1;

		return {
			...state,
			focusedIndex,
			...rebuildDiffs(fretboards, lockHighlight),
		};
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
		// ignore keys we dont want to pull from localStorage
		const IGNORE = ["rehydrateSuccess"];
		// add in special formatters for keys that were serialized to localStorage
		const HANDLERS: {
			[key in string]: (state: StateType) => any;
		} = {
			fretboards: ({ fretboards }) =>
				fretboards.map((fretboard) => fretboard.toJSON()),
		};

		let key: keyof StateType;
		for (key in state) {
			if (IGNORE.includes(key)) continue;
			let value = JSON.stringify(
				HANDLERS.hasOwnProperty(key) ? HANDLERS[key](state) : state[key]
			);
			localStorage.setItem(key, value);
		}
		return state;
	}

	NeverCalled(action);
}
