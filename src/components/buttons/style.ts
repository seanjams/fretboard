import CSS from "csstype";
import styled from "styled-components";

interface CSSProps extends CSS.Properties {
    activeColor?: string;
    active?: boolean;
}

export const Circle = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
        backgroundColor: props.active
            ? props.activeColor
            : props.backgroundColor,
    },
}))<CSSProps>`
    width: 26px;
    height: 26px;
    border-radius: 100%;
    margin-left: 5px;
    margin-right: 5px;
    text-align: center;
    line-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
`;
