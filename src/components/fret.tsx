import * as React from "react";
import styled from "styled-components";
import { FretboardContext } from "../store";
import { NOTE_BANK } from "../utils";

// CSS
interface CSSProps {
	border?: string;
	backgroundColor?: string;
}

const FretDiv = styled.div<CSSProps>`
	border: ${({ border }) => border};
	height: 40px;
	width: 8.333333%;
	display: flex;
	justify-content: center;
	align-items: center;
`;

const CircleDiv = styled.div<CSSProps>`
	border: 1px solid #333;
	color: #333;
	display: flex;
	justify-content: center;
	align-items: center;
	font-family: Roboto;
	width: 30px;
	height: 30px;
	border-radius: 100%;
	background-color: ${({ backgroundColor }) => backgroundColor};
`;

// Component
interface Props {
	value: number;
	openString?: boolean;
	active?: boolean;
}

export const Fret: React.FC<Props> = ({ value, openString, active }) => {
	const { state, dispatch } = React.useContext(FretboardContext);

	const noteIndex = value % 12;
	const note = NOTE_BANK[noteIndex];
	const backgroundColor = active
		? "#c36"
		: state.selectedNotes[noteIndex]
		? "#3c6"
		: "transparent";

	return (
		<FretDiv
			border={openString ? "none" : "1px solid #333"}
			onClick={() => dispatch({ type: "SET_NOTE", payload: noteIndex })}
		>
			<CircleDiv backgroundColor={backgroundColor}>
				{state.label === "value" ? value : note.getName(state.label)}
			</CircleDiv>
		</FretDiv>
	);
};
