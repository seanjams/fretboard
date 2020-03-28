import * as React from "react";
import { ActionTypes } from "./actions";
import { StateType } from "./state";

type ContextType = {
	state: StateType;
	dispatch: React.Dispatch<ActionTypes>;
};

export const FretboardContext = React.createContext<ContextType>(null);
export const Provider = FretboardContext.Provider;
export const Consumer = FretboardContext.Consumer;
