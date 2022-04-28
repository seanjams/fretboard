import CSS from "csstype";
import styled from "styled-components";
import { lighterGrey, lightGrey, mediumGrey, SP, white } from "../../utils";
import { generateAnimationWrapper } from "../Animation";

// should extend from some CSSProp default object so you dont have to add these manually
interface CSSProps extends CSS.Properties {
    highlightColor?: string;
}

export const PillControlsContainer = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    display: flex;
    align-items: center;
    justify-content: start;

    .pill-button-container {
        .button-div {
            border-top-left-radius: ${SP[0]}px;
            border-top-right-radius: ${SP[0]}px;
            border-bottom-left-radius: ${SP[0]}px;
            border-bottom-right-radius: ${SP[0]}px;
            margin: 0 ${SP[0]}px;
        }
    }

    .pill-button-container:first-child {
        .button-div {
            border-top-left-radius: 100%;
            border-top-right-radius: ${SP[1]}px;
            border-bottom-left-radius: 100%;
            border-bottom-right-radius: ${SP[1]}px;
            margin-left: 0;

            svg {
                padding-left: ${SP[0]}px;
            }
        }
    }

    .pill-button-container:last-child {
        .button-div {
            border-top-left-radius: ${SP[1]}px;
            border-top-right-radius: 100%;
            border-bottom-left-radius: ${SP[1]}px;
            border-bottom-right-radius: 100%;
            margin-right: 0;

            svg {
                padding-right: ${SP[0]}px;
            }
        }
    }
`;

export const Label = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    height: 8px;
    margin: 0 ${SP[2]}px ${SP[3]}px ${SP[2]}px;
    padding-bottom: ${SP[0]}px;
    border-bottom: 1px solid ${lightGrey};
    font-size: 9px;
    text-align: left;
    white-space: nowrap;
    color: ${mediumGrey};
`;

const ENTER = 250;
const EXIT = 250;
const highlightCheckboxHeight = 32;
const highlightCheckboxWidth = 80;

export const HighlightCheckboxContainer = styled.div.attrs(
    (props: CSSProps) => ({
        style: { ...props },
    })
)<CSSProps>`
    display: flex;
    align-items: center;
    justify-content: center;

    .highlight-checkbox {
        width: ${highlightCheckboxWidth}px;
        height: ${highlightCheckboxHeight}px;
        border-radius: ${highlightCheckboxHeight}px;
        padding: 6px;
        background-color: ${lighterGrey};
        transition: background-color 150ms ease-in-out;
        box-shadow: inset 0 0 4px 0 #777;
        margin-right: ${SP[2]}px;

        div {
            position: relative;
            left: 0;
            height: ${highlightCheckboxHeight}px;
            width: ${highlightCheckboxHeight}px;
            border-radius: ${highlightCheckboxHeight}px;
            background-color: white;
            box-shadow: 0 0 4px 0 #777;
        }
    }

    .clear-button .button-div {
        background-color: transparent !important;
        border-radius: 100%;

        svg path {
            fill: ${mediumGrey};
        }
    }
`;

const HighlightCheckboxAnimationWrapper = styled.div.attrs(
    (props: CSSProps) => ({
        style: { ...props },
    })
)<CSSProps>`
    .highlight-slide-enter {
        .highlight-checkbox {
            background-color: ${lighterGrey};
            div {
                left: 0px;
            }
        }

        .clear-button .button-div {
            background-color: transparent !important;

            svg path {
                fill: ${mediumGrey};
            }
        }
    }
    .highlight-slide-enter-active {
        .highlight-checkbox {
            background-color: ${(props) => props.highlightColor};
            transition: background-color ${ENTER}ms ease-in-out;

            div {
                left: ${highlightCheckboxWidth - highlightCheckboxHeight}px;
                transition: left ${ENTER}ms ease-in-out;
            }
        }

        .clear-button .button-div {
            background-color: ${(props) => props.highlightColor} !important;
            transition: background-color ${ENTER}ms ease-in-out;

            svg path {
                fill: ${white};
                transition: fill ${ENTER}ms ease-in-out;
            }
        }
    }
    .highlight-slide-enter-done {
        .highlight-checkbox {
            background-color: ${(props) => props.highlightColor};
            div {
                left: ${highlightCheckboxWidth - highlightCheckboxHeight}px;
            }
        }

        .clear-button .button-div {
            background-color: ${(props) => props.highlightColor} !important;

            svg path {
                fill: ${white};
            }
        }
    }
    .highlight-slide-exit {
        .highlight-checkbox {
            background-color: ${(props) => props.highlightColor};
            div {
                left: ${highlightCheckboxWidth - highlightCheckboxHeight}px;
            }
        }

        .clear-button .button-div {
            background-color: ${(props) => props.highlightColor} !important;

            svg path {
                fill: ${white};
            }
        }
    }
    .highlight-slide-exit-active {
        .highlight-checkbox {
            background-color: ${lighterGrey};
            transition: background-color ${EXIT}ms ease-in-out;

            div {
                left: 0px;
                transition: left ${EXIT}ms ease-in-out;
            }
        }

        .clear-button .button-div {
            background-color: transparent !important;
            transition: background-color ${EXIT}ms ease-in-out;

            svg path {
                fill: ${mediumGrey};
                transition: fill ${EXIT}ms ease-in-out;
            }
        }
    }
    .highlight-slide-exit-done {
        .highlight-checkbox {
            background-color: ${lighterGrey};
            div {
                left: 0px;
            }
        }

        .clear-button .button-div {
            background-color: transparent !important;

            svg path {
                fill: ${mediumGrey};
            }
        }
    }
`;

export const HighlightCheckboxAnimation = generateAnimationWrapper(
    HighlightCheckboxAnimationWrapper,
    { enter: ENTER, exit: EXIT },
    "highlight-slide"
);
