import CSS from "csstype";
import styled from "styled-components";
import { isMobile } from "react-device-detect";

interface CSSProps extends CSS.Properties {
    lockScroll?: boolean;
}

export const ContainerDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
    },
}))<CSSProps>`
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: ${isMobile ? "100vh" : "375px"};
    width: ${isMobile ? "100vw" : "875px"};
    font-family: Arial;
    overflow: hidden;
`;
