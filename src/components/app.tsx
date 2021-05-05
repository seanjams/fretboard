import * as React from "react";
import {
	StateType,
	ActionTypes,
	DEFAULT_STATE,
	reducer,
	Provider,
} from "../store";
import { Dashboard } from "./dashboard";
import "reset-css";

interface Props {
	oldState?: StateType;
}

export const App: React.FC<Props> = ({ oldState }) => {
	const [state, dispatch] = React.useReducer<
		React.Reducer<StateType, ActionTypes>
	>(reducer, DEFAULT_STATE());

	return (
		<Provider value={{ state, dispatch }}>
			<Dashboard oldState={oldState} />
		</Provider>
	);
};
