import CSS from "csstype";
import styled from "styled-components";

interface CSSProps extends CSS.Properties {}

export const TitleContainerDiv = styled.div<CSSProps>`
    padding: 10px 10px 0px 20px;
    font-family: Arial;
    height: 28px;
    vertical-align: top;
`;
