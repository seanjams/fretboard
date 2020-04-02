import * as React from "react";
import styled from "styled-components";
import { FretboardContext } from "../store";
import { NoteUtil } from "../utils";

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
	width: 30px;
	height: 30px;
	border-radius: 100%;
	background-color: ${({ backgroundColor }) => backgroundColor};
`;

// Component
interface Props {
	value: number;
	stringIndex: number;
	openString?: boolean;
}

export const Fret: React.FC<Props> = ({ value, openString, stringIndex }) => {
	const { state, dispatch } = React.useContext(FretboardContext);

	const note = new NoteUtil(value);
	const label = state.label === "value" ? value : note.getName(state.label);
	const backgroundColor = state.fretboard.getFret(stringIndex, value)
		? "#fc6"
		: state.fretboard.get(value)
		? "#3c6"
		: "transparent";

	function onClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>): any {
		e.preventDefault();
		if (e.metaKey || e.shiftKey) {
			dispatch({
				type: "SET_HIGHLIGHTED_NOTE",
				payload: { stringIndex, value },
			});
		} else {
			dispatch({ type: "SET_NOTE", payload: value });
		}
	}

	return (
		<FretDiv border={openString ? "none" : "1px solid #333"} onClick={onClick}>
			<CircleDiv backgroundColor={backgroundColor}>{label}</CircleDiv>
		</FretDiv>
	);
};
