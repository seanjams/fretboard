import CSS from "csstype";
import styled from "styled-components";
import { FRETBOARD_MARGIN } from "../../utils";

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

export const AnimationWrapper = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
    },
}))<CSSProps>`
    // overflow: auto;

    .overflow-container {
        height: ${(props) => props.maxFretboardHeight}px;
        max-height: ${(props) => props.maxFretboardHeight}px;
        margin-top: ${FRETBOARD_MARGIN}px;
        margin-bottom: ${FRETBOARD_MARGIN}px;
    }

    .fretboard-container {
        // max-height: ${(props) => props.maxFretboardHeight}px;
        // height: 100%;
        // width: 100%;
    }

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
        transition: all 150ms;
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
        transition: all 150ms;
        transition-delay: 150ms;
    }
    .fretboard-shrink-exit-done {
        width: 100%;
        transform: scale(1);
        transform-origin: ${(props) => props.transformOrigin} left;
    }
`;

export const FretboardContainer = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    display: flex;
    align-items: stretch;
    height: 100%;
`;

export const OverflowContainerDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
    },
}))<CSSProps>`
    width: 100%;
    margin: ${FRETBOARD_MARGIN}px 0;
    overflow-x: auto;
`;

export const FretboardDiv = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    display: flex;
    flex-direction: column;
    width: 100%;
`;
