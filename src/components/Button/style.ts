import CSS from "csstype";
import styled from "styled-components";
import { darkGrey, SP } from "../../utils";

export interface CSSProps extends CSS.Properties {
    activeColor?: string;
    active?: boolean;
    diameter?: number;
}

export const Circle = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
        boxShadow: props.active ? `inset 0 0 4px 0 #aaa` : `0 0 4px 0 #aaa`,
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
    // margin: 0 ${SP[1]}px;
`;
