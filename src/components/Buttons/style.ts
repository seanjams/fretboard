import CSS from "csstype";
import styled from "styled-components";
import { mediumGrey, SP, white } from "../../utils";

export interface CSSProps extends CSS.Properties {
    active?: boolean;
    activeColor?: string;
    activeIconColor?: string;
    iconColor?: string;
    iconHeight?: number;
    iconWidth?: number;
    isCircular?: boolean;
    pressed?: boolean;
    pressedColor?: string;
}

export const ButtonDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
        boxShadow: props.active
            ? `inset 0 0 4px 0 #666`
            : props.pressed
            ? `inset 0 0 4px 0 #666`
            : `0 0 4px 0 #999`,
        backgroundColor: props.active
            ? props.activeColor
            : props.pressed
            ? props.pressedColor
            : props.backgroundColor,
    },
}))<CSSProps>`
    border-top-left-radius: ${(props) =>
        props.isCircular ? "100%" : `${SP[1]}px`};
    border-top-right-radius: ${(props) =>
        props.isCircular ? "100%" : `${SP[1]}px`};
    border-bottom-left-radius: ${(props) =>
        props.isCircular ? "100%" : `${SP[1]}px`};
    border-bottom-right-radius: ${(props) =>
        props.isCircular ? "100%" : `${SP[1]}px`};
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 50ms ease-in-out, box-shadow 50ms ease-in-out;

    user-select: none; /* standard syntax */
    -webkit-user-select: none; /* webkit (safari, chrome) browsers */
    -moz-user-select: none; /* mozilla browsers */
    -khtml-user-select: none; /* webkit (konqueror) browsers */
    -ms-user-select: none; /* IE10+ */

    svg {
        height: ${(props) => props.iconHeight || 16}px;
        width: ${(props) => props.iconWidth || 16}px;

        path {
            fill: ${(props) =>
                props.pressed || props.active
                    ? props.activeIconColor
                    : props.iconColor};
            transition: fill 50ms ease-in-out;
        }
    }
`;
