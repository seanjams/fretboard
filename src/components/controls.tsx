import * as React from "react";
import styled from "styled-components";
import { FretboardContext } from "../store";

// CSS
interface CSSProps {}

const ButtonBank = styled.div<CSSProps>`
	display: flex;
	align-items: center;
	font-size: 10px;
	position: fixed;
	height: 40px;
`;

const ButtonContainer = styled.div<CSSProps>`
	margin: 10px;
	height: 40px;
`;

const ButtonInput = styled.button<CSSProps>`
	height: 30px;
	font-size: 14px;
`;

// Component
interface Props {}

export const Controls: React.FC<Props> = () => {
	const { state, dispatch } = React.useContext(FretboardContext);

	function onInvert(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
		e.preventDefault();
		if (state.invert) {
			window.scroll(0, 0);
		} else {
			window.scroll(document.body.scrollWidth, 0);
		}
		dispatch({ type: "INVERT" });
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
                <ButtonInput
                    onClick={() => dispatch({ type: "SET_LABEL", payload: { label: "sharp" }})}
                >
                    Sharp
                </ButtonInput>
            </ButtonContainer>
            <ButtonContainer>
                <ButtonInput
                    onClick={() => dispatch({ type: "SET_LABEL", payload: { label: "flat" }})}
                >
                    Flat
                </ButtonInput>
            </ButtonContainer>
            <ButtonContainer>
                <ButtonInput
                    onClick={() => dispatch({ type: "SET_LABEL", payload: { label: "value" }})}
                >
                    Value
                </ButtonInput>
            </ButtonContainer>
            {/* <ButtonContainer>
                <ButtonInput onClick={() => dispatch({ type: "DECREMENT_POSITION" })}>
                    &#8592;
                </ButtonInput>
            </ButtonContainer>
            <ButtonContainer>
                <ButtonInput onClick={() => dispatch({ type: "INCREMENT_POSITION" })}>
                    &#8594;
                </ButtonInput>
            </ButtonContainer> */}
            <ButtonContainer>
                <ButtonInput onClick={() => dispatch({ type: "ADD_FRETBOARD" })}>
                    &#43;
                </ButtonInput>
            </ButtonContainer>
            <ButtonContainer>
                <ButtonInput onClick={() => dispatch({ type: "REMOVE_FRETBOARD" })}>
                    &minus;
                </ButtonInput>
            </ButtonContainer>
        </ButtonBank>
	);
};
