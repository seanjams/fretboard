import CSS from "csstype";
import styled from "styled-components";

interface CSSProps extends CSS.Properties {}

export const TitleContainerDiv = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    padding: 10px 10px 0px 20px;
    font-family: Arial;
    height: 28px;
    vertical-align: top;
`;
