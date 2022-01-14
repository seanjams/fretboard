import CSS from "csstype";
import styled from "styled-components";

interface CSSProps extends CSS.Properties {}

export const TitleContainerDiv = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    font-family: Arial;
    height: 28px;
    vertical-align: top;
    padding-bottom: 10px;
`;
