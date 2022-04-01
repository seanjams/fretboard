import CSS from "csstype";
import styled from "styled-components";
import { generateAnimationWrapper } from "../Animation";

interface CSSProps extends CSS.Properties {
    maxFretboardHeight?: number;
    minFretboardHeight?: number;
    maxInputHeight?: number;
    minInputHeight?: number;
}

const getMargin = (height: number | undefined) => {
    return -(height || 0);
};

const TOP_ENTER = 150;
const TOP_DELAY = 150;
const TOP_EXIT = 150;

// Top Drawer

export const TopDrawerContainer = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    height: ${(props) => props.maxInputHeight}px;
    width: 100%;
    max-height: ${(props) => props.minInputHeight}px;
`;

const TopDrawerAnimationWrapper = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    .top-drawer-grow-enter {
        opacity: 0;
        max-height: ${(props) => props.minInputHeight}px;
        margin-bottom: 0;
    }
    .top-drawer-grow-enter-active {
        opacity: 1;
        max-height: ${(props) => props.maxInputHeight}px;
        margin-bottom: ${(props) => getMargin(props.maxInputHeight)}px;
        transition: all ${TOP_ENTER}ms ease-in-out;
        transition-delay: ${TOP_DELAY}ms;
    }
    .top-drawer-grow-enter-done {
        opacity: 1;
        max-height: ${(props) => props.maxInputHeight}px;
        margin-bottom: ${(props) => getMargin(props.maxInputHeight)}px;
    }
    .top-drawer-grow-exit {
        opacity: 1;
        max-height: ${(props) => props.maxInputHeight}px;
        margin-bottom: ${(props) => getMargin(props.maxInputHeight)}px;
    }
    .top-drawer-grow-exit-active {
        opacity: 0;
        max-height: ${(props) => props.minInputHeight}px;
        margin-bottom: 0;
        transition: all ${TOP_EXIT}ms ease-in-out;
    }
    .top-drawer-grow-exit-done {
        opacity: 0;
        max-height: ${(props) => props.minInputHeight}px;
        margin-bottom: 0;
    }
`;

export const TopDrawerAnimation = generateAnimationWrapper(
    TopDrawerAnimationWrapper,
    { enter: TOP_ENTER + TOP_DELAY, exit: TOP_EXIT },
    "top-drawer-grow"
);

// Bottom Drawer

const BOTTOM_ENTER = 300;
// const BOTTOM_DELAY = 150
const BOTTOM_EXIT = 150;

export const BottomDrawerContainer = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    height: ${(props) => props.maxInputHeight}px;
    width: 100%;
    max-height: ${(props) => props.minInputHeight}px;
`;

const BottomDrawerAnimationWrapper = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    .bottom-drawer-grow-enter {
        opacity: 0;
        max-height: ${(props) => props.minInputHeight}px;
        margin-top: 0;
    }
    .bottom-drawer-grow-enter-active {
        opacity: 1;
        max-height: ${(props) => props.maxInputHeight}px;
        margin-top: ${(props) => getMargin(props.maxInputHeight)}px;
        transition: opacity ${BOTTOM_ENTER}ms ease-out;
    }
    .bottom-drawer-grow-enter-done {
        opacity: 1;
        max-height: ${(props) => props.maxInputHeight}px;
        margin-top: ${(props) => getMargin(props.maxInputHeight)}px;
    }
    .bottom-drawer-grow-exit {
        opacity: 1;
        max-height: ${(props) => props.maxInputHeight}px;
        margin-top: ${(props) => getMargin(props.maxInputHeight)}px;
    }
    .bottom-drawer-grow-exit-active {
        opacity: 0;
        max-height: ${(props) => props.minInputHeight}px;
        margin-top: 0;
        transition: opacity ${BOTTOM_EXIT}ms ease-in;
    }
    .bottom-drawer-grow-exit-done {
        opacity: 0;
        max-height: ${(props) => props.minInputHeight}px;
        margin-top: 0;
    }
`;

export const BottomDrawerAnimation = generateAnimationWrapper(
    BottomDrawerAnimationWrapper,
    { enter: BOTTOM_ENTER, exit: BOTTOM_EXIT },
    "bottom-drawer-grow"
);
