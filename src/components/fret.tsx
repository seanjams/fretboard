import { fill } from "lodash";
import * as React from "react";
import styled from "styled-components";
import {
	STANDARD_TUNING,
	FRETBOARD_WIDTH,
	STRING_SIZE,
	CIRCLE_SIZE,
} from "../consts";
import { FretboardContext, useStore } from "../store";
import { mod, NoteUtil, COLORS, FretboardUtil } from "../utils";

// CSS
interface CSSProps {
	width?: number;
	height?: number;
	border?: string;
	color?: string;
	backgroundColor?: string;
	left?: number;
}

const FretDiv = styled.div.attrs((props: CSSProps) => ({
	style: {
		borderLeft: props.border,
		borderRight: props.border,
		width: `${props.width}%`,
	},
}))<CSSProps>`
	height: 33px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	position: relative;
`;

const CircleDiv = styled.div.attrs((props: CSSProps) => ({
	style: {
		color: props.color,
		// backgroundColor: props.backgroundColor,
	},
}))<CSSProps>`
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
	background-color: transparent;
	z-index: 9999;
`;

const ShadowDiv = styled.div.attrs((props: CSSProps) => ({
	style: {
		left: `${props.left}%`,
		width: props.width,
		backgroundColor: props.backgroundColor,
	},
}))<CSSProps>`
	margin-left: -13px;
	margin-right: -13px;
	width: 26px;
	height: 26px;
	border-radius: 100%;
	z-index: 9998;
	position: absolute;
	top: 4px;
	// left: 50%;
`;

const LineDiv = styled.div.attrs((props: CSSProps) => ({
	style: {
		height: `${props.height}px`,
		backgroundColor: props.backgroundColor,
	},
}))<CSSProps>`
	width: calc(50% - 13px);
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
	const sliderBarRef = React.useRef<HTMLElement>();
	const progressBarRef = React.useRef<HTMLElement>();
	const shadowRef = React.useRef<HTMLDivElement>();
	const fretboardRef = React.useRef<FretboardUtil>();
	const leftDiffRef = React.useRef<{ [key in number]: number }>();
	const rightDiffRef = React.useRef<{ [key in number]: number }>();
	fretboardRef.current = state.fretboards[fretboardIndex];
	sliderBarRef.current = document.getElementById("slider-bar");
	progressBarRef.current = document.getElementById("progress-bar");

	const getFretboardDiff = (left = false) => {
		const currentFretboard = state.fretboards[fretboardIndex];
		if (left && fretboardIndex === 0) return;
		if (!left && fretboardIndex === state.fretboards.length - 1) return;

		const targetFretboard =
			state.fretboards[fretboardIndex + (left ? -1 : 1)];

		return currentFretboard.compare(targetFretboard);
	};

	leftDiffRef.current = getFretboardDiff(true);
	rightDiffRef.current = getFretboardDiff(false);

	React.useEffect(() => {
		return useStore.subscribe(
			(progress: number) => {
				if (shadowRef.current) {
					const noteValue = mod(value, 12);
					let newLeft;
					let fillPercentage;
					if (progress < fretboardIndex) {
						// all altered notes should be 100% to the left
						if (
							leftDiffRef.current &&
							leftDiffRef.current[noteValue] !== undefined
						) {
							if (leftDiffRef.current[noteValue] === -9999) {
								fillPercentage = 0;
								// } else if (
								// 	leftDiffRef.current[noteValue] === 9999
								// ) {
								// 	console.log("2");
								// 	fillPercentage = 0;
							} else {
								newLeft =
									leftDiffRef.current[noteValue] * 100 + 50;
							}
						}
					} else if (
						fretboardIndex <= progress &&
						progress <= fretboardIndex + 0.3
					) {
						// all altered notes should be x% to the left
						const x =
							((fretboardIndex + 0.3 - progress) * 100) / 0.6;
						if (
							leftDiffRef.current &&
							leftDiffRef.current[noteValue] !== undefined
						) {
							if (leftDiffRef.current[noteValue] === -9999) {
								fillPercentage = 100 - 2 * x;
								// } else if (
								// 	leftDiffRef.current[noteValue] === 9999
								// ) {
								// 	console.log("4");
								// 	fillPercentage = 2 * x;
							} else {
								const multiplier =
									leftDiffRef.current[noteValue];
								newLeft = multiplier * x + 50;
							}
						}
					} else if (
						fretboardIndex + 0.3 < progress &&
						progress <= fretboardIndex + 0.7
					) {
						// all altered notes should be in the middle
						newLeft = 50;
						fillPercentage = 100;
					} else if (
						fretboardIndex + 0.7 < progress &&
						progress < fretboardIndex + 1
					) {
						// all altered notes should be x% to the left
						const x =
							((progress - (fretboardIndex + 0.7)) * 100) / 0.6;

						if (
							rightDiffRef.current &&
							rightDiffRef.current[noteValue] !== undefined
						) {
							if (rightDiffRef.current[noteValue] === -9999) {
								fillPercentage = 100 - 2 * x;
								// } else if (
								// 	rightDiffRef.current[noteValue] === 9999
								// ) {
								// 	console.log("6");
								// 	fillPercentage = 2 * x;
							} else {
								const multiplier =
									rightDiffRef.current[noteValue];
								newLeft = multiplier * x + 50;
							}
						}
					} else if (fretboardIndex + 1 <= progress) {
						// all altered notes should be 100% to the right
						if (
							rightDiffRef.current &&
							rightDiffRef.current[noteValue] !== undefined
						) {
							if (rightDiffRef.current[noteValue] === -9999) {
								fillPercentage = 0;
								// } else if (
								// 	rightDiffRef.current[noteValue] === 9999
								// ) {
								// 	console.log("8");
								// 	fillPercentage = 0;
							} else {
								const multiplier =
									rightDiffRef.current[noteValue];
								newLeft = multiplier * 100 + 50;
							}
						}
					}

					if (newLeft !== undefined)
						shadowRef.current.style.left = `${newLeft}%`;
					if (fillPercentage !== undefined) {
						const diameter = (CIRCLE_SIZE * fillPercentage) / 100;
						const radius = diameter / 2;
						shadowRef.current.style.width = `${diameter}px`;
						shadowRef.current.style.height = `${diameter}px`;
						shadowRef.current.style.marginLeft = `-${radius}px`;
						shadowRef.current.style.marginRight = `-${radius}px`;
						shadowRef.current.style.top = `${
							4 - radius + CIRCLE_SIZE / 2
						}px`;
					}
				}
			},
			(state) => state.progress
		);
	}, []);

	function onContextMenu(
		e?: React.MouseEvent<HTMLDivElement, MouseEvent>
	): void {
		e && e.preventDefault();
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
	// const color = isHighlighted ? "white" : "#333";
	const color = false ? "white" : "#333";
	const fretIndex = value - STANDARD_TUNING[stringIndex];

	// makes frets progressively smaller
	// what did I even do here. Basically its some line
	// const fretWidth = (1 + (12 - fretIndex) / 30) * 8.333333;

	// temporary until I scale it to no moving target
	const fretWidth = FRETBOARD_WIDTH / STRING_SIZE;

	const thickness = (6 - stringIndex + 1) / 2;
	const border = openString ? "none" : "1px solid #333";

	return (
		<FretDiv
			border={border}
			width={fretWidth}
			onContextMenu={onContextMenu}
		>
			<LineDiv
				height={thickness}
				backgroundColor={!!fretIndex ? "#333" : "transparent"}
			/>
			<CircleDiv
				onClick={onClick}
				onTouchStart={onClick}
				backgroundColor={backgroundColor}
				color={color}
			>
				{label}
			</CircleDiv>
			{backgroundColor !== "white" && (
				<ShadowDiv
					ref={shadowRef}
					backgroundColor={backgroundColor}
					left={50}
				/>
			)}
			<LineDiv
				height={thickness}
				backgroundColor={!!fretIndex ? "#333" : "transparent"}
			/>
		</FretDiv>
	);
};
