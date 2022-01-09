import CSS from "csstype";
import styled from "styled-components";
import { FRETBOARD_MARGIN } from "../../utils";

interface CSSProps extends CSS.Properties {
    maxFretboardHeight?: number;
    minFretboardHeight?: number;
}

export const AnimationWrapper = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    .fretboard-container {
        max-height: ${(props) => props.maxFretboardHeight}px;
        height: 100%;
        width: 100%;
    }

    .fretboard-shrink-enter {
        max-height: ${(props) => props.maxFretboardHeight}px;
    }
    .fretboard-shrink-enter-active {
        max-height: ${(props) => props.minFretboardHeight}px;
        transition: all 150ms;
    }
    .fretboard-shrink-enter-done {
        max-height: ${(props) => props.minFretboardHeight}px;
    }
    .fretboard-shrink-exit {
        max-height: ${(props) => props.minFretboardHeight}px;
    }
    .fretboard-shrink-exit-active {
        max-height: ${(props) => props.maxFretboardHeight}px;
        transition: all 150ms;
    }
    .fretboard-shrink-exit-done {
        max-height: ${(props) => props.maxFretboardHeight}px;
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
