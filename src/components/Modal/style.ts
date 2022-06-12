import CSS from "csstype";
import styled from "styled-components";
import { lighterGrey, SP } from "../../utils";

interface CSSProps extends CSS.Properties {}

export const ContainerDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
    },
}))<CSSProps>`
    position: absolute;
    top: 0;
    z-index: 10001;
    margin: ${SP[3]}px;
    border-radius: ${SP[7]}px;
    height: calc(100vh - ${2 * SP[3]}px);
    width: calc(100vw - ${2 * SP[3]}px);
    background-color: ${lighterGrey};
    box-shadow: 0 0 30px 0 #444;
`;

export const ContentDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
    },
}))<CSSProps>`
    height: calc(100% - ${2 * SP[6]}px);
    width: calc(100% - ${SP[10]}px);
    padding-top: ${SP[6]}px;
    padding-bottom: ${SP[6]}px;
    padding-left: ${SP[10]}px;
    overflow-y: auto;
    overflow-x: hidden;
`;

export const CloseButton = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
    },
}))<CSSProps>`
    height: calc(100% - ${SP[2]}px);
    text-align: center;
    color: #333;
    width: ${SP[10]}px;
    font-size: ${SP[6]}px;
    padding-top: ${SP[2]}px;
    display: flex;
    justify-content: start;
    align-content: start;
`;
