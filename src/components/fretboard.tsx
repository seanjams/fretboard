import * as React from "react";
import styled from "styled-components";
import { STANDARD_TUNING } from "../consts";
import { FretboardContext } from "../store";
import { String } from "./string";
import { Legend } from "./legend";

// CSS
interface CSSProps {}

const FretboardDiv = styled.div<CSSProps>`
	margin-top: 30px;
	display: flex;
	flex-direction: column;
	width: 2000px;
`;

// Component
interface Props {
	fretboardIndex: number;
}

export const Fretboard: React.FC<Props> = ({ fretboardIndex }) => {
	const { state, dispatch } = React.useContext(FretboardContext);

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
		if (fretboardIndex === state.focusedIndex) {
			if (e.key === "ArrowRight") {
				e.preventDefault();
				dispatch({ type: "INCREMENT_POSITION", payload: { fretboardIndex } });
			} else if (e.key === "ArrowLeft") {
				e.preventDefault();
				dispatch({ type: "DECREMENT_POSITION", payload: { fretboardIndex } });
			}
		}
	}

	return (
		<FretboardDiv onClick={onClick} onContextMenu={onClick}>
			<Legend fretboardIndex={fretboardIndex} top={true} />
				{state.invert ? strings : strings.reverse()}
			<Legend fretboardIndex={fretboardIndex} />
		</FretboardDiv>
	);
};
