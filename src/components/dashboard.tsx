import * as React from "react";
import styled from "styled-components";
import { StateType, FretboardContext, StateModel } from "../store";
import { Fretboard } from "./fretboard";
import { NavControls } from "./controls";
import { Slider } from "./slider";

// CSS
interface CSSProps {}

const NavContainerDiv = styled.div<CSSProps>`
	position: fixed;
	z-index: 10000;
	width: 100vw;
`;

const ContainerDiv = styled.div<CSSProps>`
	font-family: Arial;
	position: absolute;
	top: 160px;
`;

// Component
interface Props {
	oldState?: StateType;
}

export const Dashboard: React.FC<Props> = ({ oldState }) => {
	const { state, dispatch } = React.useContext(FretboardContext);

	React.useEffect(() => {
		rehydrateState();
		window.addEventListener("beforeunload", saveToLocalStorage);
		return () => {
			saveToLocalStorage();
			window.removeEventListener("beforeunload", saveToLocalStorage);
		};
	}, []);

	const saveToLocalStorage = () => {
		dispatch({ type: "SAVE_TO_LOCAL_STORAGE" });
	};

	const rehydrateState = () => {
		let newState: StateType = StateModel.default();
		if (oldState) {
			newState = { ...newState, ...oldState };
		} else {
			newState = { ...newState, ...StateModel.fromLocalStorage() };
		}

		dispatch({ type: "REHYDRATE", payload: newState });
	};

	return (
		<div>
			<NavContainerDiv>
				<NavControls />
				<Slider />
			</NavContainerDiv>
			<ContainerDiv>
				<Fretboard fretboardIndex={state.focusedIndex} />
			</ContainerDiv>
		</div>
	);
};
