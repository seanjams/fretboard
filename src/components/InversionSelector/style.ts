import CSS from "csstype";
import styled from "styled-components";

interface CSSProps extends CSS.Properties {}

export const ContainerDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
        // add style props here and style below
    },
}))<CSSProps>`
    display: flex;
    align-items: center;
    justify-content: center;
`;
