import CSS from "csstype";
import styled from "styled-components";
import {
    oliveGreen,
    lighterGrey,
    mediumGrey,
    SAFETY_AREA_MARGIN,
    SP,
} from "../../utils";

interface CSSProps extends CSS.Properties {
    selected?: boolean;
}

export const ContainerDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
        // add style props here and style below
    },
}))<CSSProps>`
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const ProgressionSelectorContainer = styled.div.attrs(
    (props: CSSProps) => ({
        style: {
            ...props,
        },
    })
)<CSSProps>`
    width: calc(100% - ${2 * SAFETY_AREA_MARGIN}px);
    padding: 0 ${SAFETY_AREA_MARGIN}px;
    height: 100%;
`;

export const SelectorContainer = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
    },
}))<CSSProps>`
    height: 100%;
    width: 80%;
    position: relative;
    top: 0;
    left: 0;

    .overflow-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: calc(100% - ${2 * SP[0]}px);
        margin-top: ${SP[0]}px;
        margin-bottom: ${SP[0]}px;
        // border-radius: 999999px;
        border-radius: ${SP[3]}px;
    }
`;

export const OverflowContainerDiv = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    overflow-x: auto;
    background-color: ${lighterGrey};
`;

export const ShadowOverlay = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    z-index: 9999;
    box-shadow: inset 0 0 4px 0 #777;
    pointer-events: none;
`;

export const ProgressionOptionContainer = styled.div.attrs(
    (props: CSSProps) => ({
        style: {
            ...props,
            backgroundColor: props.selected ? oliveGreen : "white",
        },
    })
)<CSSProps>`
    border-radius: ${SP[2]}px;
    box-shadow: 0 0 4px 0 #aaa;
    margin-top: ${SP[1]}px;
    margin-bottom: ${SP[1]}px;
    margin-left: ${SP[2]}px;
    margin-right: ${SP[2]}px;
    height: calc(100% - ${2 * SP[1]}px);
    min-width: 100px;
    opacity: 1;
`;

export const EmptyOption = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
    },
}))<CSSProps>`
    font-size: 12px;
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
    margin-top: -10px;
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
