import CSS from "csstype";
import styled from "styled-components";

interface CSSProps extends CSS.Properties {
    maxFretboardHeight?: number;
    minFretboardHeight?: number;
    maxInputHeight?: number;
    minInputHeight?: number;
}

const getOverflowMargin = (height: number | undefined) => {
    return -(height || 0);
};

export const TopDrawerAnimationWrapper = styled.div.attrs(
    (props: CSSProps) => ({
        style: { ...props },
    })
)<CSSProps>`
    .top-drawer-form {
        opacity: 0;
        height: ${(props) => props.maxInputHeight}px;
        width: 100%;
        max-height: ${(props) => props.minInputHeight}px;
    }

    .top-drawer-grow-enter {
        opacity: 0;
        max-height: ${(props) => props.minInputHeight}px;
        margin-bottom: 0;
    }
    .top-drawer-grow-enter-active {
        opacity: 1;
        max-height: ${(props) => props.maxInputHeight}px;
        margin-bottom: ${(props) => getOverflowMargin(props.maxInputHeight)}px;
        transition: all 150ms ease-in-out;
        transition-delay: 150ms;
    }
    .top-drawer-grow-enter-done {
        opacity: 1;
        max-height: ${(props) => props.maxInputHeight}px;
        margin-bottom: ${(props) => getOverflowMargin(props.maxInputHeight)}px;
    }
    .top-drawer-grow-exit {
        opacity: 1;
        max-height: ${(props) => props.maxInputHeight}px;
        margin-bottom: ${(props) => getOverflowMargin(props.maxInputHeight)}px;
    }
    .top-drawer-grow-exit-active {
        opacity: 0;
        max-height: ${(props) => props.minInputHeight}px;
        margin-bottom: 0;
        transition: all 150ms ease-in-out;
    }
    .top-drawer-grow-exit-done {
        opacity: 0;
        max-height: ${(props) => props.minInputHeight}px;
        margin-bottom: 0;
    }
`;

export const BottomDrawerAnimationWrapper = styled.div.attrs(
    (props: CSSProps) => ({
        style: { ...props },
    })
)<CSSProps>`
    .bottom-drawer-form {
        opacity: 0;
        height: ${(props) => props.maxInputHeight}px;
        width: 100%;
        max-height: ${(props) => props.minInputHeight}px;
    }

    .bottom-drawer-grow-enter {
        opacity: 0;
        max-height: ${(props) => props.minInputHeight}px;
        margin-top: 0;
    }
    .bottom-drawer-grow-enter-active {
        opacity: 1;
        max-height: ${(props) => props.maxInputHeight}px;
        margin-top: ${(props) => getOverflowMargin(props.maxInputHeight)}px;
        transition: all 150ms ease-in-out;
        transition-delay: 150ms;
    }
    .bottom-drawer-grow-enter-done {
        opacity: 1;
        max-height: ${(props) => props.maxInputHeight}px;
        margin-top: ${(props) => getOverflowMargin(props.maxInputHeight)}px;
    }
    .bottom-drawer-grow-exit {
        opacity: 1;
        max-height: ${(props) => props.maxInputHeight}px;
        margin-top: ${(props) => getOverflowMargin(props.maxInputHeight)}px;
    }
    .bottom-drawer-grow-exit-active {
        opacity: 0;
        max-height: ${(props) => props.minInputHeight}px;
        margin-top: 0;
        transition: all 150ms ease-in-out;
    }
    .bottom-drawer-grow-exit-done {
        opacity: 0;
        max-height: ${(props) => props.minInputHeight}px;
        margin-top: 0;
    }
`;
