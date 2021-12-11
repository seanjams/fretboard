import CSS from "csstype";
import styled from "styled-components";

// should extend from some CSSProp default object so you dont have to add these manually
interface CSSProps extends CSS.Properties {}

export const CircleControlsContainer = styled.div<CSSProps>`
    display: flex;
    align-items: center;
    justify-content: start;
    width: 100%;
`;

export const Label = styled.div<CSSProps>`
    width: 30px;
    height: 8px;
    margin: 3px 5px;
    font-size: 9px;
    text-align: center;
`;
