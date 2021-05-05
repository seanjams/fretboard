import * as React from "react";
import styled from "styled-components";
import { StateType, FretboardContext, DEFAULT_STATE } from "../store";
import { FretboardUtil } from "../utils";
import { Fretboard } from "./fretboard";
import { NavControls } from "./controls";
import { Slider } from "./slider";

// CSS
interface CSSProps {}

const ContainerDiv = styled.div<CSSProps>`
	width: 100vw;
	overflow-x: auto;
	font-family: Arial;
`;

// Component
interface Props {
	oldState?: StateType;
}

function parseItem(key: keyof StateType): any {
	let value: any = localStorage.getItem(key);
	if (value) {
		try {
			value = JSON.parse(value);
			if (key === "fretboards" && Array.isArray(value)) {
				value = value.map(
					(fretboard) =>
						new FretboardUtil(fretboard.notes, fretboard.strings)
				);
			}
		} catch (e) {}
	}
	return value;
}

function fromLocalStorage(): StateType {
	const defaultState = DEFAULT_STATE();
	return {
		fretboards: parseItem("fretboards") || defaultState.fretboards,
		leftDiffs: parseItem("leftDiffs") || defaultState.leftDiffs,
		rightDiffs: parseItem("rightDiffs") || defaultState.rightDiffs,
		label: parseItem("label") || defaultState.label,
		invert: parseItem("invert") || defaultState.invert,
		leftHand: parseItem("leftHand") || defaultState.leftHand,
		stringSize: parseItem("stringSize") || defaultState.stringSize,
		focusedIndex: parseItem("focusedIndex") || defaultState.focusedIndex,
	};
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
		let newState = DEFAULT_STATE();
		if (oldState) {
			newState = { ...newState, ...oldState };
		} else {
			newState = { ...newState, ...fromLocalStorage() };
		}

		dispatch({ type: "REHYDRATE", payload: newState });
	};

	return (
		<div>
			<ContainerDiv>
				<NavControls />
			</ContainerDiv>
			<ContainerDiv>
				<Fretboard fretboardIndex={state.focusedIndex} />
			</ContainerDiv>
			<ContainerDiv>
				<Slider />
			</ContainerDiv>
		</div>
	);
};
