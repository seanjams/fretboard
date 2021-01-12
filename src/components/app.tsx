import * as React from "react";
import {
	StateType,
	ActionTypes,
	DEFAULT_STATE,
	reducer,
	Provider,
} from "../store";
import { Dashboard } from "./dashboard";

interface Props {
	oldState?: {};
}

export const App: React.FC<Props> = ({}) => {
	const [state, dispatch] = React.useReducer<
		React.Reducer<StateType, ActionTypes>
	>(reducer, DEFAULT_STATE);

	return (
		<Provider value={{ state, dispatch }}>
			<Dashboard />
		</Provider>
	);
};
