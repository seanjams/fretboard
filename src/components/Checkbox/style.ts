import CSS from "csstype";
import styled from "styled-components";
import { COLORS, lightGrey } from "../../utils";

// should extend from some CSSProp default object so you dont have to add these manually
interface CSSProps extends CSS.Properties {}

const [secondaryColor, primaryColor] = COLORS[0];

const ENTER = 250;
const EXIT = 250;
const checkboxHeight = 16;
const checkboxWidth = 40;

const CheckboxAnimationWrapper = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    .checkbox-form {
        .checkbox {
            width: ${checkboxWidth}px;
            height: ${checkboxHeight}px;
            border-radius: ${checkboxHeight}px;
            padding: 4px;
            background-color: #eee;
            box-shadow: inset 0 0 2px 0 #777;

            div {
                position: relative;
                left: 0;
                height: ${checkboxHeight}px;
                width: ${checkboxHeight}px;
                border-radius: ${checkboxHeight}px;
                background-color: white;
                box-shadow: 0 0 2px 0 #777;
            }
        }
    }

    .checkbox-slide-enter {
        .checkbox {
            // background-color: ${lightGrey};
            div {
                left: 0px;
            }
        }
    }
    .checkbox-slide-enter-active {
        .checkbox {
            // background-color: ${primaryColor};
            // transition: background-color ${ENTER}ms ease-in-out;

            div {
                left: ${checkboxWidth - checkboxHeight}px;
                transition: left ${ENTER}ms ease-in-out;
            }
        }
    }
    .checkbox-slide-enter-done {
        .checkbox {
            // background-color: ${primaryColor};
            div {
                left: ${checkboxWidth - checkboxHeight}px;
            }
        }
    }
    .checkbox-slide-exit {
        .checkbox {
            // background-color: ${primaryColor};
            div {
                left: ${checkboxWidth - checkboxHeight}px;
            }
        }
    }
    .checkbox-slide-exit-active {
        .checkbox {
            // background-color: ${lightGrey};
            // transition: background-color ${EXIT}ms ease-in-out;

            div {
                left: 0px;
                transition: left ${EXIT}ms ease-in-out;
            }
        }
    }
    .checkbox-slide-exit-done {
        .checkbox {
            // background-color: ${lightGrey};
            div {
                left: 0px;
            }
        }
    }
`;

export const CheckboxAnimation = {
    timeout: { enter: ENTER, exit: EXIT },
    wrapper: CheckboxAnimationWrapper,
};
