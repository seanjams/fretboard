import { DEFAULT_NOTESWITCH } from "../consts";
import { ActionTypes } from "./actions";
import { StateType } from "./state";

export function reducer(state: StateType, action: ActionTypes): StateType {
	switch (action.type) {
		case "CLEAR":
			return { ...state, selectedNotes: { ...DEFAULT_NOTESWITCH } };
		case "SET_NOTE":
			const selectedNotes = state.selectedNotes;
			selectedNotes[action.payload] = !selectedNotes[action.payload];
			return { ...state, selectedNotes };
		case "SET_LABEL":
			return { ...state, label: action.payload };
		case "INCREMENT_POSITION":
			return { ...state, position: state.position + 1 };
		case "DECREMENT_POSITION":
			const position = state.position - 1 >= 0 ? state.position - 1 : 0;
			return { ...state, position };
		case "SET_NOTES_PER_STRING":
			return { ...state, notesPerString: action.payload };
		default:
			NeverCalled(action);
	}
}

function NeverCalled(never: never): void {}
