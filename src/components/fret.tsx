import * as React from "react";
import styled from "styled-components";
import { STANDARD_TUNING } from "../consts";
import { FretboardContext } from "../store";
import { mod, NoteUtil, COLORS } from "../utils";

// CSS
interface CSSProps {
	width?: number;
	height?: number;
	border?: string;
	color?: string;
	backgroundColor?: string;
}

const FretDiv = styled.div<CSSProps>`
	border-left: ${({ border }) => border};
	border-right: ${({ border }) => border};
	height: 33px;
	width: ${({ width }) => width}%;
	display: flex;
	justify-content: center;
	align-items: center;
`;

const CircleDiv = styled.div<CSSProps>`
	margin-left: -13px;
	margin-right: -13px;
	border: 1px solid #333;
	color: #333;
	display: flex;
	justify-content: center;
	align-items: center;
	width: 26px;
	height: 26px;
	border-radius: 100%;
	color: ${({ color }) => color};
	background-color: ${({ backgroundColor }) => backgroundColor};
	z-index: 9999;
`;

const LineDiv = styled.div<CSSProps>`
	width: 50%;
	height: ${({ height }) => height}px;
	background: #333;
	margin: auto 0;
`;

// Component
interface Props {
	value: number;
	stringIndex: number;
	fretboardIndex: number;
	openString?: boolean;
}

export const Fret: React.FC<Props> = ({
	fretboardIndex,
	value,
	openString,
	stringIndex,
}) => {
	const { state, dispatch } = React.useContext(FretboardContext);
	const fretboard = state.fretboards[fretboardIndex];
	// const [secondaryColor, primaryColor] = COLORS[mod(fretboardIndex, COLORS.length)];
	const [secondaryColor, primaryColor] = COLORS[0];

	const note = new NoteUtil(value);
	const label = state.label === "value" ? value : note.getName(state.label);
	const isHighlighted = fretboard.getFret(stringIndex, value);
	const backgroundColor = isHighlighted
		? primaryColor
		: fretboard.get(value)
		? secondaryColor
		: "white";
	const color = isHighlighted ? "white" : "#333";
	const fretIndex = value - STANDARD_TUNING[stringIndex];
	const fretWidth = (1 + (12 - fretIndex) / 30) * 8.333333;
	const thickness = (6 - stringIndex + 1) / 2;
	const border = openString ? "none" : "1px solid #333";

	function onContextMenu(
		e?: React.MouseEvent<HTMLDivElement, MouseEvent>
	): void {
		e && e.preventDefault();
		console.log("IN HERE");
		dispatch({
			type: "SET_HIGHLIGHTED_NOTE",
			payload: { stringIndex, value, fretboardIndex },
		});
	}

	function onClick(
		e:
			| React.TouchEvent<HTMLDivElement>
			| React.MouseEvent<HTMLDivElement, MouseEvent>
	) {
		const conditions = [];
		if (e.nativeEvent instanceof MouseEvent) {
			conditions.push(e.nativeEvent.metaKey, e.nativeEvent.shiftKey);
		} else if (e.nativeEvent instanceof TouchEvent) {
			conditions.push(e.nativeEvent.touches.length > 1);
		} else {
			return;
		}

		if (conditions.some((condition) => condition)) {
			onContextMenu();
		} else {
			dispatch({
				type: "SET_NOTE",
				payload: { fretboardIndex, note: value },
			});
		}
	}

	return (
		<FretDiv
			border={border}
			width={fretWidth}
			onContextMenu={onContextMenu}
		>
			{!!fretIndex && <LineDiv height={thickness} />}
			<CircleDiv
				onClick={onClick}
				onTouchStart={onClick}
				backgroundColor={backgroundColor}
				color={color}
			>
				{label}
			</CircleDiv>
			{!!fretIndex && <LineDiv height={thickness} />}
		</FretDiv>
	);
};
