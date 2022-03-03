import CSS from "csstype";
import styled from "styled-components";
import { darkGrey, SP } from "../../utils";

export interface CSSProps extends CSS.Properties {
    activeColor?: string;
    active?: boolean;
    pressed?: boolean;
    diameter?: number;
    iconWidth?: number;
    iconHeight?: number;
    isCircular?: boolean;
}

export const ButtonDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
        boxShadow: props.active
            ? `inset 0 0 4px 0 #aaa`
            : props.pressed
            ? `inset 0 0 4px 0 #aaa`
            : `0 0 4px 0 #aaa`,
    },
}))<CSSProps>`
    width: ${(props) => props.diameter || 0}px;
    height: ${(props) => props.diameter || 0}px;
    border-top-left-radius: ${(props) =>
        props.isCircular ? "100%" : `${SP[1]}px`};
    border-top-right-radius: ${(props) =>
        props.isCircular ? "100%" : `${SP[1]}px`};
    border-bottom-left-radius: ${(props) =>
        props.isCircular ? "100%" : `${SP[1]}px`};
    border-bottom-right-radius: ${(props) =>
        props.isCircular ? "100%" : `${SP[1]}px`};
    text-align: center;
    line-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    user-select: none; /* standard syntax */
    -webkit-user-select: none; /* webkit (safari, chrome) browsers */
    -moz-user-select: none; /* mozilla browsers */
    -khtml-user-select: none; /* webkit (konqueror) browsers */
    -ms-user-select: none; /* IE10+ */

    img {
        height: ${(props) => props.iconHeight || 16}px;
        width: ${(props) => props.iconWidth || 16}px;
        // filter: brightness(0) saturate(100%) invert(100%) sepia(1%)
        //     saturate(2808%) hue-rotate(322deg) brightness(82%) contrast(80%);
        filter: brightness(0) saturate(100%) invert(51%) sepia(4%) saturate(8%)
            hue-rotate(358deg) brightness(97%) contrast(92%);
    }
`;
