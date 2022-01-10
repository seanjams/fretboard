import CSS from "csstype";
import styled from "styled-components";
import { darkGrey } from "../../utils";

export interface CSSProps extends CSS.Properties {
    activeColor?: string;
    active?: boolean;
    diameter?: number;
}

export const Circle = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
        backgroundColor: props.active
            ? props.activeColor
            : props.backgroundColor || "transparent",
    },
}))<CSSProps>`
    width: ${(props) => props.diameter || 0}px;
    height: ${(props) => props.diameter || 0}px;
    text-align: center;
    line-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid ${darkGrey};
    cursor: pointer;

    // &:active {
    //     background: #e5e5e5;
    //     -webkit-box-shadow: inset 0px 0px 5px #c1c1c1;
    //     -moz-box-shadow: inset 0px 0px 5px #c1c1c1;
    //     box-shadow: inset 0px 0px 5px #c1c1c1;
    //     outline: none;
    // }
`;
