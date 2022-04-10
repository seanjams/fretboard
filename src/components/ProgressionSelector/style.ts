import CSS from "csstype";
import styled from "styled-components";
import { mediumGrey, SP, sandy } from "../../utils";

interface CSSProps extends CSS.Properties {
    selected?: boolean;
}

export const ProgressionSelectorContainer = styled.div.attrs(
    (props: CSSProps) => ({
        style: {
            ...props,
        },
    })
)<CSSProps>`
    width: 100%;
    height: 100%;
`;

export const ProgressionOptionContainer = styled.div.attrs(
    (props: CSSProps) => ({
        style: {
            ...props,
            backgroundColor: props.selected ? sandy : "transparent",
        },
    })
)<CSSProps>`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    height: 100%;
    padding: 0 ${SP[4]}px;
    z-index: 0;
`;

export const EmptyOption = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
    },
}))<CSSProps>`
    font-size: 12px;
    min-width: 120px;
    text-align: center;
    color: ${mediumGrey};
    padding-left: ${SP[1]}px;
    padding-right: ${SP[1]}px;
`;

export const LastUpdatedTime = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
    },
}))<CSSProps>`
    width: calc(100% - 10px);
    text-align: right;
    font-size: 8px;
    margin-top: -12px;
    margin-right: 10px;
    color: ${mediumGrey};
`;

const ENTER = 150;
// const BOTTOM_DELAY = 150
const EXIT = 150;

const OptionAnimationWrapper = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    height: 100%;
    width: 100%;

    .option-shrink-enter {
        // opacity: 1;
        width: calc(100% - ${2 * SP[2]}px);
        div {
            opacity: 1;
        }
    }
    .option-shrink-enter-active {
        // opacity: 0;
        width: 0%;
        div {
            opacity: 0;
            transition: opacity ${ENTER}ms ease-out;
        }
        transition: width ${ENTER}ms ease-out;
    }
    .option-shrink-enter-done {
        // opacity: 0;
        width: 0%;
        div {
            opacity: 0;
        }
    }
    .option-shrink-exit {
        // opacity: 0;
        width: 0%;
        div {
            opacity: 0;
        }
    }
    .option-shrink-exit-active {
        // opacity: 1;
        width: calc(100% - ${2 * SP[2]}px);
        div {
            opacity: 1;
            transition: opacity ${EXIT}ms ease-in;
        }
        transition: width ${EXIT}ms ease-in;
    }
    .option-shrink-exit-done {
        // opacity: 1;
        width: calc(100% - ${2 * SP[2]}px);
        div {
            opacity: 1;
        }
    }
`;

export const OptionAnimation = {
    timeout: { enter: ENTER, exit: EXIT },
    wrapper: OptionAnimationWrapper,
};
