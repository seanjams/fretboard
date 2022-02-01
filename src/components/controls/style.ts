import CSS from "csstype";
import styled from "styled-components";
import { COLORS, lightGrey, mediumGrey, SP } from "../../utils";

// should extend from some CSSProp default object so you dont have to add these manually
interface CSSProps extends CSS.Properties {}

const [secondaryColor, primaryColor] = COLORS[0];

export const CircleControlsContainer = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    display: flex;
    align-items: center;
    justify-content: start;

    .circle-button-container {
        .circle-button {
            margin: 0 ${SP[0]}px;
        }
    }

    .circle-button-container:first-child {
        .circle-button {
            border-top-left-radius: 100%;
            border-bottom-left-radius: 100%;
            margin-left: 0;
        }
    }

    .circle-button-container:last-child {
        .circle-button {
            border-top-right-radius: 100%;
            border-bottom-right-radius: 100%;
        }
    }
`;

export const Label = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    height: 8px;
    margin: 3px 0;
    font-size: 9px;
    text-align: center;
    white-space: nowrap;
`;

export const HighlightCheckboxAnimationWrapper = styled.div.attrs(
    (props: CSSProps) => ({
        style: { ...props },
    })
)<CSSProps>`
    .highlight-form {
        .highlight-checkbox {
            width: 80px;
            height: 32px;
            border-radius: 32px;
            padding: 6px;
            background-color: ${lightGrey};
            box-shadow: inset 0 0 4px 0 #777;
            margin-right: ${SP[2]}px;

            div {
                position: relative;
                left: 0;
                height: 32px;
                width: 32px;
                border-radius: 32px;
                background-color: white;
                box-shadow: 0 0 4px 0 #777;
            }
        }

        .clear-button .circle-button {
            background-color: transparent !important;
            border-radius: 100%;
        }
    }

    .highlight-slide-enter {
        .highlight-checkbox {
            background-color: ${lightGrey};
            div {
                left: 0px;
            }
        }

        .clear-button .circle-button {
            background-color: transparent !important;
        }
    }
    .highlight-slide-enter-active {
        .highlight-checkbox {
            background-color: ${primaryColor};
            transition: background-color 150ms ease-in-out;

            div {
                left: 48px;
                transition: left 150ms ease-in-out;
            }
        }

        .clear-button .circle-button {
            background-color: ${primaryColor} !important;
            transition: background-color 150ms ease-in-out;
        }
    }
    .highlight-slide-enter-done {
        .highlight-checkbox {
            background-color: ${primaryColor};
            div {
                left: 48px;
            }
        }

        .clear-button .circle-button {
            background-color: ${primaryColor} !important;
        }
    }
    .highlight-slide-exit {
        .highlight-checkbox {
            background-color: ${primaryColor};
            div {
                left: 48px;
            }
        }

        .clear-button .circle-button {
            background-color: ${primaryColor} !important;
        }
    }
    .highlight-slide-exit-active {
        .highlight-checkbox {
            background-color: ${lightGrey};
            transition: background-color 150ms ease-in-out;

            div {
                left: 0px;
                transition: left 150ms ease-in-out;
            }
        }

        .clear-button .circle-button {
            background-color: transparent !important;
            transition: background-color 150ms ease-in-out;
        }
    }
    .highlight-slide-exit-done {
        .highlight-checkbox {
            background-color: ${lightGrey};
            div {
                left: 0px;
            }
        }

        .clear-button .circle-button {
            background-color: transparent !important;
        }
    }
`;
