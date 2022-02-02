import CSS from "csstype";
import styled from "styled-components";
import { darkGrey, SP } from "../../utils";

export interface CSSProps extends CSS.Properties {
    activeColor?: string;
    active?: boolean;
    pressed?: boolean;
    diameter?: number;
}

export const Circle = styled.div.attrs((props: CSSProps) => ({
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
`;
