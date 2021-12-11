import CSS from "csstype";
import styled from "styled-components";

interface CSSProps extends CSS.Properties {}

export const FretboardContainer = styled.div.attrs((props: CSSProps) => ({
    style: {
        width: props.width,
    },
}))<CSSProps>`
    display: flex;
    align-items: stretch;
`;

export const FretboardDiv = styled.div<CSSProps>`
    display: flex;
    flex-direction: column;
    width: 100%;
`;
