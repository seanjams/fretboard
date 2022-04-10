import CSS from "csstype";
import styled from "styled-components";
import { COLORS, lighterGrey, mediumGrey, white } from "../../utils";
import { generateAnimationWrapper } from "../Animation";

// should extend from some CSSProp default object so you dont have to add these manually
interface CSSProps extends CSS.Properties {
    isLeft?: boolean;
}

const [secondaryColor, primaryColor] = COLORS[0];

const ENTER = 250;
const EXIT = 250;
const checkboxHeight = 16;
const checkboxWidth = 40;

export const CheckboxContainer = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
    },
}))<CSSProps>`
    display: flex;
    justify-content: center;
    align-items: center;

    .checkbox {
        width: ${checkboxWidth}px;
        height: ${checkboxHeight}px;
        border-radius: ${checkboxHeight}px;
        padding: 4px;
        background-color: ${lighterGrey};
        box-shadow: inset 0 0 2px 0 #777;

        div {
            position: relative;
            left: 0;
            height: ${checkboxHeight}px;
            width: ${checkboxHeight}px;
            border-radius: ${checkboxHeight}px;
            background-color: ${white};
            box-shadow: 0 0 2px 0 #444;
        }
    }
`;

export const CheckboxLabel = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
        paddingLeft: props.isLeft ? "12px" : "6px",
        paddingRight: props.isLeft ? "6px" : "12px",
        textAlign: props.isLeft ? "right" : "left",
    },
}))<CSSProps>`
    font-size: 10px;
    color: ${mediumGrey};
`;

const CheckboxAnimationWrapper = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    .checkbox-slide-enter {
        .checkbox {
            div {
                left: 0px;
            }
        }
    }
    .checkbox-slide-enter-active {
        .checkbox {
            div {
                left: ${checkboxWidth - checkboxHeight}px;
                transition: left ${ENTER}ms ease-in-out;
            }
        }
    }
    .checkbox-slide-enter-done {
        .checkbox {
            div {
                left: ${checkboxWidth - checkboxHeight}px;
            }
        }
    }
    .checkbox-slide-exit {
        .checkbox {
            div {
                left: ${checkboxWidth - checkboxHeight}px;
            }
        }
    }
    .checkbox-slide-exit-active {
        .checkbox {
            div {
                left: 0px;
                transition: left ${EXIT}ms ease-in-out;
            }
        }
    }
    .checkbox-slide-exit-done {
        .checkbox {
            div {
                left: 0px;
            }
        }
    }
`;

export const CheckboxAnimation = generateAnimationWrapper(
    CheckboxAnimationWrapper,
    { enter: ENTER, exit: EXIT },
    "checkbox-slide"
);
