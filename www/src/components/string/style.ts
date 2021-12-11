import CSS from "csstype";
import styled from "styled-components";

interface CSSProps extends CSS.Properties {}

export const StringDiv = styled.div<CSSProps>`
    display: flex;
    width: 100%;
`;
