import * as React from "react";
import styled from "styled-components";
import { FretboardContext } from "../store";

// CSS
interface CSSProps {
	width?: number;
}

const TextContainer = styled.div<CSSProps>`
	font-family: Arial;
	font-size: 14px;
	padding-left: 40px;
`;

const ButtonBank = styled.div<CSSProps>`
	display: flex;
	align-items: center;
	font-size: 10px;
	background: white;
	width: 100vw;
	margin: 10px 0;
`;

const ButtonContainer = styled.div<CSSProps>`
	margin: 0 10px;
`;

const ButtonInput = styled.button<CSSProps>`
	height: 30px;
	font-size: 14px;
	white-space: nowrap;
	min-width: 30px;
`;

// Component
interface Props {}

export const NavControls: React.FC<Props> = () => {
	const { state, dispatch } = React.useContext(FretboardContext);

	function onInvert(
		e: React.MouseEvent<HTMLButtonElement, MouseEvent>
	): void {
		e.preventDefault();
		if (state.invert) {
			window.scroll(0, 0);
		} else {
			window.scroll(document.body.scrollWidth, 0);
		}
		dispatch({ type: "INVERT" });
	}

	function onLeftHand(
		e: React.MouseEvent<HTMLButtonElement, MouseEvent>
	): void {
		e.preventDefault();
		dispatch({ type: "LEFT_HAND" });
	}

	return (
		<ButtonBank>
			<ButtonContainer>
				<ButtonInput onClick={() => dispatch({ type: "CLEAR" })}>
					Clear
				</ButtonInput>
			</ButtonContainer>
			<ButtonContainer>
				<ButtonInput onClick={onInvert}>Invert</ButtonInput>
			</ButtonContainer>
			<ButtonContainer>
				<ButtonInput onClick={onLeftHand}>
					{state.leftHand ? "Right" : "Left"} Hand
				</ButtonInput>
			</ButtonContainer>
			<ButtonContainer>
				<ButtonInput
					onClick={() =>
						dispatch({
							type: "SET_LABEL",
							payload: { label: "sharp" },
						})
					}
				>
					Sharp
				</ButtonInput>
			</ButtonContainer>
			<ButtonContainer>
				<ButtonInput
					onClick={() =>
						dispatch({
							type: "SET_LABEL",
							payload: { label: "flat" },
						})
					}
				>
					Flat
				</ButtonInput>
			</ButtonContainer>
			<ButtonContainer>
				<ButtonInput
					onClick={() =>
						dispatch({
							type: "SET_LABEL",
							payload: { label: "value" },
						})
					}
				>
					Value
				</ButtonInput>
			</ButtonContainer>
			<TextContainer>
				Click to set a note. Right click or Shift + click to highlight a
				pattern. Arrow keys Up/Down/Left/Right to move pattern.
			</TextContainer>
		</ButtonBank>
	);
};
