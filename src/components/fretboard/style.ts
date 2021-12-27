import CSS from "csstype";
import styled from "styled-components";

interface CSSProps extends CSS.Properties {}

export const FretboardContainer = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    display: flex;
    align-items: stretch;
    height: 100%;
`;

export const FretboardDiv = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    display: flex;
    flex-direction: column;
    width: 100%;
`;
