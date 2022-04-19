import CSS from "csstype";
import styled from "styled-components";
import { isMobile } from "react-device-detect";
import { backgroundThemeColor, SAFETY_AREA_MARGIN, SP } from "../../utils";

interface CSSProps extends CSS.Properties {
    lockScroll?: boolean;
    gutterHeight?: number;
    isTop?: boolean;
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
    transition: background-color 350ms ease-in-out;
`;

export const GutterDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
    },
}))<CSSProps>`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: ${(props) => (props.isTop ? "flex-start" : "flex-end")};
    height: ${(props) => props.gutterHeight || 0}px;
    margin: 0;
    width: calc(100% - ${2 * SAFETY_AREA_MARGIN}px);
    padding: 0 ${SAFETY_AREA_MARGIN}px;
`;

export const DrawerContainer = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
    },
}))<CSSProps>`
    margin-top: ${(props) => (props.isTop ? 0 : SP[1])}px;
    margin-bottom: ${(props) => (props.isTop ? SP[1] : 0)}px;
    margin-left: ${SAFETY_AREA_MARGIN}px;
    margin-right: ${SAFETY_AREA_MARGIN}px;
    height: calc(100% - ${SP[1]}px);
    width: calc(100% - ${2 * SAFETY_AREA_MARGIN}px);
`;
