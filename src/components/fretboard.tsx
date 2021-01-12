import * as React from "react";
import styled from "styled-components";
import { STANDARD_TUNING, NATURAL_NOTE_NAMES, E, B, C, F } from "../consts";
import { FretboardContext } from "../store";
import { String } from "./string";
import { Legend } from "./legend";

// CSS
interface CSSProps {
	color?: string;
}

const FretboardContainer = styled.div<CSSProps>`
	margin-top: 30px;
	display: flex;
	align-items: stretch;
`;

const FretboardDiv = styled.div<CSSProps>`
	display: flex;
	flex-direction: column;
	width: 2000px;
`;

const FocusBar = styled.div<CSSProps>`
	width: 10px;
	border-radius: 3px;
	background-color: ${({ color }) => color};
`;

// Component
interface Props {
	fretboardIndex: number;
}

export const Fretboard: React.FC<Props> = ({ fretboardIndex }) => {
	const { state, dispatch } = React.useContext(FretboardContext);
	const { focusedIndex, fretboards } = state;

	let naturals: { [key in string]: number } = {};
	let i = 0;
	for (let name of NATURAL_NOTE_NAMES) {
		if (state.label === "flat") {
			naturals[name] = i;
			if (name !== F && name !== C) i++;
			naturals[name.toLowerCase()] = i;
			i++;
		} else if (state.label === "sharp") {
			naturals[name.toLowerCase()] = i;
			if (name !== E && name !== B) i++;
			naturals[name] = i;
			i++;
		}
	}

	React.useEffect(() => {
		window.addEventListener("keydown", onKeyPress);
		return () => {
			window.removeEventListener("keydown", onKeyPress);
		};
	});

	const strings = STANDARD_TUNING.map((value, i) => {
		return <String fretboardIndex={fretboardIndex} stringIndex={i} base={value} key={`string-${fretboardIndex}-${i}`} />;
	});

	function onClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>): void {
		dispatch({ type: "SET_FOCUS", payload: { fretboardIndex }});
	}

	function onKeyPress(this: Window, e: KeyboardEvent): any {
		if (fretboardIndex === focusedIndex) {
			if (e.key === "ArrowUp" && focusedIndex > 0) {
				e.preventDefault();
				dispatch({ type: "SET_FOCUS", payload: { fretboardIndex: fretboardIndex - 1 } });
			} else if (e.key === "ArrowDown" && focusedIndex < fretboards.length - 1) {
				e.preventDefault();
				dispatch({ type: "SET_FOCUS", payload: { fretboardIndex: fretboardIndex + 1 } });
			} else if (e.key === "ArrowRight") {
				e.preventDefault();
				dispatch({ type: "INCREMENT_POSITION", payload: { fretboardIndex } });
			} else if (e.key === "ArrowLeft") {
				e.preventDefault();
				dispatch({ type: "DECREMENT_POSITION", payload: { fretboardIndex } });
			} else if (naturals.hasOwnProperty(e.key)) {
				e.preventDefault();
				dispatch({ type: "SET_NOTE", payload: { fretboardIndex, note: naturals[e.key] } })
			}
		}
	}

	return (
		<FretboardContainer>
			<FocusBar color={fretboardIndex === state.focusedIndex ? "#933" : "transparent"} />
			<FretboardDiv onClick={onClick} onContextMenu={onClick}>
				<Legend fretboardIndex={fretboardIndex} top={true} />
					{state.invert ? strings : strings.reverse()}
				<Legend fretboardIndex={fretboardIndex} />
			</FretboardDiv>
		</FretboardContainer>
	);
};
