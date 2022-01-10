import CSS from "csstype";
import styled from "styled-components";
import { SP } from "../../utils";

interface CSSProps extends CSS.Properties {
    highlighted?: boolean;
    maxInputHeight?: number;
    minInputHeight?: number;
    maxFretboardHeight?: number;
}

export const getOverflowMargin = (height: number | undefined) => {
    return -(height || 0);
};

export const AnimationWrapper = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    .input-form {
        opacity: 0;
        height: 100%;
        width: 100%;
        max-height: ${(props) => props.minInputHeight}px;
    }

    .input-grow-enter {
        opacity: 0;
        max-height: ${(props) => props.minInputHeight}px;
        margin-bottom: 0;
    }
    .input-grow-enter-active {
        opacity: 1;
        max-height: ${(props) => props.maxInputHeight}px;
        margin-bottom: ${(props) => getOverflowMargin(props.maxInputHeight)}px;
        transition: all 150ms ease-in-out;
        transition-delay: 150ms;
    }
    .input-grow-enter-done {
        opacity: 1;
        max-height: ${(props) => props.maxInputHeight}px;
        margin-bottom: ${(props) => getOverflowMargin(props.maxInputHeight)}px;
    }
    .input-grow-exit {
        opacity: 1;
        max-height: ${(props) => props.maxInputHeight}px;
        margin-bottom: ${(props) => getOverflowMargin(props.maxInputHeight)}px;
    }
    .input-grow-exit-active {
        opacity: 0;
        max-height: ${(props) => props.minInputHeight}px;
        margin-bottom: 0;
        transition: all 150ms ease-in-out;
    }
    .input-grow-exit-done {
        opacity: 0;
        max-height: ${(props) => props.minInputHeight}px;
        margin-bottom: 0;
    }
`;

export const ChordInputContainer = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    display: flex;
    flex-direction: column;
    align-items: start;
    width: 100%;
    height: 100%;
`;

export const FlexRow = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    display: flex;
    align-items: start;
    justify-content: center;
`;

export const Title = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    font-size: 14px;
    margin: auto 0;
`;

export const Tag = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
        border: props.highlighted ? "2px solid #000" : "2px solid transparent",
    },
}))<CSSProps>`
    margin: 4px 8px 4px 0;
    border-radius: 4px;
    min-width: 26px;
    min-height: 14px;
    font-size: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
    flex-shrink: 0;
`;

export const OverflowContainerDiv = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    position: relative;
    z-index: 999;

    & > div {
        overflow-x: auto;
        width: 100%;
        height: 100%;
    }

    ::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: ${3 * SP[7]}px;
        background-image: linear-gradient(
            to left,
            rgba(255, 255, 255, 0),
            white 85%
        );
        pointer-events: none;
    }
    ::after {
        content: "";
        position: absolute;
        bottom: 0;
        top: 0;
        right: 0;
        width: ${3 * SP[7]}px;
        background-image: linear-gradient(
            to right,
            rgba(255, 255, 255, 0),
            white 85%
        );
        pointer-events: none;
    }
`;
