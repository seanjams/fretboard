import CSS from "csstype";
import styled from "styled-components";
import { lighterGrey, SP } from "../../utils";

interface CSSProps extends CSS.Properties {}

export const ContainerDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
    },
}))<CSSProps>`
    // position: relative;
    overflow-y: auto;
    overflow-x: hidden;
    width: 100%;
    height: fit-content;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: start;
`;

export const VideoContainer = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
    },
}))<CSSProps>`
    position: relative;
    top: 0;
    left: 0;

    div,
    video {
        position: absolute;
        top: 0;
        left: 0;
        width: ${(props) => props.width};
        height: ${(props) => props.height};
    }

    // shadow overlay
    div {
        box-shadow: 0 0 ${SP[2]}px ${SP[2]}px ${lighterGrey} inset;
        z-index: 9999;
    }
`;
