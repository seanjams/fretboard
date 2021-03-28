import * as React from "react";
import {
	StateType,
	ActionTypes,
	StateModel,
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
	>(reducer, StateModel.default());

	return (
		<Provider value={{ state, dispatch }}>
			<Dashboard oldState={oldState} />
		</Provider>
	);
};
