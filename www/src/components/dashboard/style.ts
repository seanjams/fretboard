import CSS from "csstype";
import styled from "styled-components";
import { SAFETY_AREA_MARGIN, FRETBOARD_MARGIN } from "../../utils";

interface CSSProps extends CSS.Properties {
    maxInputHeight?: number;
    minInputHeight?: number;
    maxFretboardHeight?: number;
    minFretboardHeight?: number;
    lockScroll?: boolean;
}

export const InputAnimationWrapper = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    .input-container {
        max-height: ${(props) => props.minInputHeight}px;
    }

    .input-grow-enter {
        max-height: ${(props) => props.minInputHeight}px;
    }
    .input-grow-enter-active {
        max-height: ${(props) => props.maxInputHeight}px;
        transition: max-height 150ms;
    }
    .input-grow-enter-done {
        max-height: ${(props) => props.maxInputHeight}px;
    }
    .input-grow-exit {
        max-height: ${(props) => props.maxInputHeight}px;
    }
    .input-grow-exit-active {
        max-height: ${(props) => props.minInputHeight}px;
        transition: max-height 150ms;
        transition-delay: 75ms;
    }
`;

export const FretboardAnimationWrapper = styled.div.attrs(
    (props: CSSProps) => ({
        style: { ...props },
    })
)<CSSProps>`
    .fretboard-container {
        max-height: ${(props) => props.maxFretboardHeight}px;
        height: 100%;
    }

    .fretboard-shrink-enter {
        max-height: ${(props) => props.maxFretboardHeight}px;
    }
    .fretboard-shrink-enter-active {
        max-height: ${(props) => props.minFretboardHeight}px;
        transition: max-height 150ms;
    }
    .fretboard-shrink-enter-done {
        max-height: ${(props) => props.minFretboardHeight}px;
    }
    .fretboard-shrink-exit {
        max-height: ${(props) => props.minFretboardHeight}px;
    }
    .fretboard-shrink-exit-active {
        max-height: ${(props) => props.maxFretboardHeight}px;
        transition: max-height 150ms;
        transition-delay: 75ms;
    }
`;

export const ContainerDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
        width: props.width,
        height: props.height,
    },
}))<CSSProps>`
    font-family: Arial;
    overflow: hidden;
    width: 100vw;
`;

export const FlexContainerDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
        height: props.height,
        marginTop: props.marginTop || 0,
        marginBottom: props.marginBottom || 0,
    },
}))<CSSProps>``;

export const OverflowContainerDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
        height: props.height,
        overflowX: props.lockScroll ? "hidden" : "auto",
    },
}))<CSSProps>`
    width: 100%;
    overflow-x: auto;
    margin: ${FRETBOARD_MARGIN}px 0;
`;

export const FlexRow = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    display: flex;
    justify-content: space-evenly;
    align-items: ${(props) => props.alignItems};
`;
