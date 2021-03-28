import * as React from "react";
import styled from "styled-components";
import { StateType, FretboardContext, StateModel } from "../store";
import { Fretboard } from "./fretboard";
import { NavControls, AddFretboardControls } from "./controls";

// CSS
interface CSSProps {}

const ContainerDiv = styled.div<CSSProps>`
	font-family: Arial;
	position: absolute;
	top: 40px;
`;

const FretboardControlsContainerDiv = styled.div<CSSProps>`
	width: 100vw;
	display: flex;
	justify-content: flex-end;
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
			<NavControls />
			<ContainerDiv>
				{state.fretboards.map((_, i) => (
					<Fretboard key={`fretboard-${i}`} fretboardIndex={i} />
				))}
				<FretboardControlsContainerDiv>
					<AddFretboardControls />
				</FretboardControlsContainerDiv>
			</ContainerDiv>
		</div>
	);
};
