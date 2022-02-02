import CSS from "csstype";
import styled from "styled-components";

interface CSSProps extends CSS.Properties {
    minInputHeight?: number;
    maxInputHeight?: number;
}

export const getOverflowMargin = (height: number | undefined) => {
    return -(height || 0);
};

const ENTER = 150;
const DELAY = 150;
const EXIT = 150;

const AnimationWrapper = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    .settings-form {
        opacity: 0;
        max-height: ${(props) => props.minInputHeight}px;
    }

    .settings-grow-enter {
        opacity: 0;
        max-height: ${(props) => props.minInputHeight}px;
        margin-top: 0;
    }
    .settings-grow-enter-active {
        opacity: 1;
        max-height: ${(props) => props.maxInputHeight}px;
        margin-top: ${(props) => getOverflowMargin(props.maxInputHeight)}px;
        transition: all ${ENTER}ms ease-in-out;
        transition-delay: ${DELAY}ms;
    }
    .settings-grow-enter-done {
        opacity: 1;
        max-height: ${(props) => props.maxInputHeight}px;
        margin-top: ${(props) => getOverflowMargin(props.maxInputHeight)}px;
    }
    .settings-grow-exit {
        opacity: 1;
        max-height: ${(props) => props.maxInputHeight}px;
        margin-top: ${(props) => getOverflowMargin(props.maxInputHeight)}px;
    }
    .settings-grow-exit-active {
        opacity: 0;
        max-height: ${(props) => props.minInputHeight}px;
        margin-top: 0;
        transition: all ${EXIT}ms ease-in-out;
    }
    .settings-grow-exit-done {
        opacity: 0;
        max-height: ${(props) => props.minInputHeight}px;
        margin-top: 0;
    }
`;

export const SettingsAnimationWrapper = {
    timeout: { enter: ENTER + DELAY, exit: EXIT },
    wrapper: AnimationWrapper,
};
