import * as React from "react";
import styled from "styled-components";
import { FretboardContext } from "../store";
import { LabelTypes, ArrowTypes } from "../types";
import { getPositionActionType } from "../utils";

// CSS
interface CSSProps {
	width?: number;
}

// const TextContainer = styled.div<CSSProps>`
// 	font-family: Arial;
// 	font-size: 14px;
// 	padding-left: 40px;
// `;

const ButtonBank = styled.div<CSSProps>`
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-size: 10px;
	background: transparent;
	width: 100vw;
	margin: 5px 0 10px 0;
`;

const FlexRowCenter = styled.div<CSSProps>`
	display: flex;
	align-items: center;
	justify-content: center;
`;

const SelectInput = styled.select<CSSProps>`
	height: 28px;
	font-size: 14px;
	white-space: nowrap;
	min-width: 28px;
	margin: 0 10px;
`;

const ButtonInput = styled.button<CSSProps>`
	height: 28px;
	font-size: 14px;
	white-space: nowrap;
	min-width: 28px;
	margin: 0 10px;
`;

const Spacer = styled.div<CSSProps>`
	height: 28px;
	min-width: 97px;
`;

const ButtonArrow = styled.button<CSSProps>`
	font-size: 14px;
	margin: 3px;
`;

const ArrowControlsContainer = styled.div<CSSProps>`
	display: flex;
	align-items: center;
	margin: 0 10px;
`;

const ArrowControlsMiddleColumn = styled.div<CSSProps>`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: space-between;
`;

// Component
interface Props {}

export const NavControls: React.FC<Props> = () => {
	const { state, dispatch } = React.useContext(FretboardContext);
	const leftHandRef = React.useRef(false);
	const invertRef = React.useRef(false);
	const focusedIndexRef = React.useRef(0);
	leftHandRef.current = state.leftHand;
	invertRef.current = state.invert;
	focusedIndexRef.current = state.focusedIndex;

	function onInvert(
		e:
			| React.MouseEvent<HTMLButtonElement, MouseEvent>
			| React.TouchEvent<HTMLButtonElement>
	) {
		e.preventDefault();
		if (invertRef.current) {
			window.scroll(0, 0);
		} else {
			window.scroll(document.body.scrollWidth, 0);
		}
		dispatch({ type: "INVERT" });
	}

	function onLeftHand(
		e:
			| React.MouseEvent<HTMLButtonElement, MouseEvent>
			| React.TouchEvent<HTMLButtonElement>
	) {
		e.preventDefault();
		dispatch({ type: "LEFT_HAND" });
	}

	function onLockHighlight(
		e:
			| React.MouseEvent<HTMLButtonElement, MouseEvent>
			| React.TouchEvent<HTMLButtonElement>
	) {
		e.preventDefault();
		dispatch({ type: "LOCK_HIGHLIGHT" });
	}

	const setLabel = (label: LabelTypes) => () => {
		dispatch({
			type: "SET_LABEL",
			payload: { label },
		});
	};

	const onArrowPress = (direction: ArrowTypes) => () => {
		const actionType = getPositionActionType(
			invertRef.current,
			leftHandRef.current,
			direction
		);

		if (actionType) {
			dispatch({
				type: actionType,
			});
		}
	};

	const onLabelChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
		const value = e.currentTarget.value as LabelTypes;
		setLabel(value);
	};

	return (
		<ButtonBank>
			<FlexRowCenter>
				<Spacer />
				<ButtonInput
					onClick={() => dispatch({ type: "CLEAR" })}
					onTouchStart={() => dispatch({ type: "CLEAR" })}
				>
					Clear
				</ButtonInput>
				<ButtonInput onClick={onInvert} onTouchStart={onInvert}>
					Invert
				</ButtonInput>
				<ButtonInput onClick={onLeftHand} onTouchStart={onLeftHand}>
					{state.leftHand ? "Right" : "Left"} Hand
				</ButtonInput>
				<SelectInput onChange={onLabelChange}>
					<option value="sharp">Sharp</option>
					<option value="flat">Flat</option>
					<option value="value">Value</option>
				</SelectInput>
				<ButtonInput
					onClick={onLockHighlight}
					onTouchStart={onLeftHand}
				>
					{state.lockHighlight
						? "Unlock Highlight"
						: "Lock Highlight"}
				</ButtonInput>
			</FlexRowCenter>
			<ArrowControlsContainer>
				<FlexRowCenter>
					<ButtonArrow
						onClick={onArrowPress("ArrowLeft")}
						onTouchStart={onArrowPress("ArrowLeft")}
					>
						&larr;
					</ButtonArrow>
				</FlexRowCenter>
				<ArrowControlsMiddleColumn>
					<ButtonArrow
						onClick={onArrowPress("ArrowUp")}
						onTouchStart={onArrowPress("ArrowUp")}
					>
						&uarr;
					</ButtonArrow>
					<ButtonArrow
						onClick={onArrowPress("ArrowDown")}
						onTouchStart={onArrowPress("ArrowDown")}
					>
						&darr;
					</ButtonArrow>
				</ArrowControlsMiddleColumn>
				<FlexRowCenter>
					<ButtonArrow
						onClick={onArrowPress("ArrowRight")}
						onTouchStart={onArrowPress("ArrowRight")}
					>
						&rarr;
					</ButtonArrow>
				</FlexRowCenter>
			</ArrowControlsContainer>
			{/* <TextContainer>
				Click to set a note. Right click or Shift + click to highlight a
				pattern. Arrow keys Up/Down/Left/Right to move pattern.
			</TextContainer> */}
		</ButtonBank>
	);
};
