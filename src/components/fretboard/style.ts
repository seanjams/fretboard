import CSS from "csstype";
import styled from "styled-components";
import { FRETBOARD_MARGIN, FRETBOARD_WIDTH } from "../../utils";

interface CSSProps extends CSS.Properties {
    maxFretboardHeight?: number;
    minFretboardHeight?: number;
    maxInputHeight?: number;
    transformOrigin?: string;
}

const getOverFlowScale = (
    maxInputHeight: number | undefined,
    maxFretboardHeight: number | undefined
) => {
    const scale = 1 - (maxInputHeight || 0) / (maxFretboardHeight || 0);
    const width = 100 / scale;

    return [width, scale];
};

export const FretboardContainer = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    display: flex;
    align-items: stretch;
    height: ${(props) =>
        (props.maxFretboardHeight || 0) - 2 * FRETBOARD_MARGIN}px;
    width: ${FRETBOARD_WIDTH}px;
    padding-top: ${FRETBOARD_MARGIN}px;
    padding-bottom: ${FRETBOARD_MARGIN}px;
`;

export const OverflowContainerDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
    },
}))<CSSProps>`
    width: 100%;
    overflow-x: auto;
    height: ${(props) => props.maxFretboardHeight}px;
    max-height: ${(props) => props.maxFretboardHeight}px;
`;

export const FretboardDiv = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    display: flex;
    flex-direction: column;
    width: 100%;
`;

const ENTER = 150;
const DELAY = 150;
const EXIT = 150;

const FretboardAnimationWrapper = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
    },
}))<CSSProps>`
    .fretboard-shrink-enter {
        width: 100%;
        transform: scale(1);
        transform-origin: ${(props) => props.transformOrigin} left;
    }
    .fretboard-shrink-enter-active {
        width: ${(props) =>
            getOverFlowScale(
                props.maxInputHeight,
                props.maxFretboardHeight
            )[0]}%;
        transform: scale(
            ${(props) =>
                getOverFlowScale(
                    props.maxInputHeight,
                    props.maxFretboardHeight
                )[1]}
        );
        transform-origin: ${(props) => props.transformOrigin} left;
        transition: all ${ENTER}ms;
    }
    .fretboard-shrink-enter-done {
        width: ${(props) =>
            getOverFlowScale(
                props.maxInputHeight,
                props.maxFretboardHeight
            )[0]}%;
        transform: scale(
            ${(props) =>
                getOverFlowScale(
                    props.maxInputHeight,
                    props.maxFretboardHeight
                )[1]}
        );
        transform-origin: ${(props) => props.transformOrigin} left;
    }
    .fretboard-shrink-exit {
        width: ${(props) =>
            getOverFlowScale(
                props.maxInputHeight,
                props.maxFretboardHeight
            )[0]}%;
        transform: scale(
            ${(props) =>
                getOverFlowScale(
                    props.maxInputHeight,
                    props.maxFretboardHeight
                )[1]}
        );
        transform-origin: ${(props) => props.transformOrigin} left;
    }
    .fretboard-shrink-exit-active {
        width: 100%;
        transform: scale(1);
        transform-origin: ${(props) => props.transformOrigin} left;
        transition: all ${EXIT}ms;
        transition-delay: ${DELAY}ms;
    }
    .fretboard-shrink-exit-done {
        width: 100%;
        transform: scale(1);
        transform-origin: ${(props) => props.transformOrigin} left;
    }
`;

export const FretboardAnimation = {
    timeout: { enter: ENTER, exit: EXIT + DELAY },
    wrapper: FretboardAnimationWrapper,
};
