import * as React from "react";
import {
	StateType,
	ActionTypes,
	DEFAULT_STATE,
	reducer,
	Provider,
} from "../store";
import { Fretboard } from "./fretboard";

interface Props {
	oldState?: {};
}

export const App: React.FC<Props> = ({}) => {
	const [state, dispatch] = React.useReducer<
		React.Reducer<StateType, ActionTypes>
	>(reducer, DEFAULT_STATE);

	return (
		<Provider value={{ state, dispatch }}>
			<Fretboard />
		</Provider>
	);
};
