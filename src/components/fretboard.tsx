import * as React from "react";
import styled from "styled-components";
import { STANDARD_TUNING, NATURAL_NOTE_NAMES, E, B, C, F } from "../consts";
import { FretboardContext } from "../store";
import { String } from "./string";
import { Legend } from "./legend";
import { KeyControlTypes } from "../types";

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
	const { focusedIndex } = state;

	// whether the high E string appears on the top or bottom of the fretboard,
	// depending on invert/leftHand views
	const highEBottom: boolean = state.invert !== state.leftHand;

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
		const keyMap: {[key: string]: KeyControlTypes} = {
			"ArrowUp": highEBottom ? "DECREMENT_POSITION_Y" : "INCREMENT_POSITION_Y",
			"ArrowDown": highEBottom ? "INCREMENT_POSITION_Y" : "DECREMENT_POSITION_Y",
			"ArrowRight": state.invert ? "DECREMENT_POSITION_X" : "INCREMENT_POSITION_X",
			"ArrowLeft": state.invert ? "INCREMENT_POSITION_X" : "DECREMENT_POSITION_X",
		};

		if (fretboardIndex === focusedIndex) {
			if (keyMap.hasOwnProperty(e.key)) {
				e.preventDefault();
				dispatch({ type: keyMap[e.key], payload: { fretboardIndex } });
			} else if (naturals.hasOwnProperty(e.key)) {
				e.preventDefault();
				dispatch({ type: "SET_NOTE", payload: { fretboardIndex, note: naturals[e.key] } })
			}
		}
	}

	return (
		<FretboardContainer>
			{!state.invert && <FocusBar color={fretboardIndex === state.focusedIndex ? "#933" : "transparent"} />}
			<FretboardDiv onClick={onClick} onContextMenu={onClick}>
				<Legend fretboardIndex={fretboardIndex} top={true} />
					{highEBottom ? strings : strings.reverse()}
				<Legend fretboardIndex={fretboardIndex} />
			</FretboardDiv>
			{state.invert && <FocusBar color={fretboardIndex === state.focusedIndex ? "#933" : "transparent"} />}
		</FretboardContainer>
	);
};
