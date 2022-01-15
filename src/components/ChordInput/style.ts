import CSS from "csstype";
import styled from "styled-components";
import { SP } from "../../utils";

interface CSSProps extends CSS.Properties {
    highlighted?: boolean;
}

export const ChordInputContainer = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    display: flex;
    flex-direction: column;
    align-items: start;
    width: 100%;
    height: 100%;
`;

export const Title = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    font-size: 14px;
    margin: auto 0;
`;

export const Tag = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
        border: props.highlighted ? "2px solid #000" : "2px solid transparent",
    },
}))<CSSProps>`
    margin: 4px 8px 4px 0;
    border-radius: 4px;
    min-width: 26px;
    min-height: 14px;
    font-size: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
    flex-shrink: 0;
`;

export const OverflowContainerDiv = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    position: relative;
    z-index: 999;

    & > div {
        overflow-x: auto;
        width: 100%;
        height: 100%;
    }

    ::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: ${3 * SP[7]}px;
        background-image: linear-gradient(
            to left,
            rgba(255, 255, 255, 0),
            white 85%
        );
        pointer-events: none;
    }
    ::after {
        content: "";
        position: absolute;
        bottom: 0;
        top: 0;
        right: 0;
        width: ${3 * SP[7]}px;
        background-image: linear-gradient(
            to right,
            rgba(255, 255, 255, 0),
            white 85%
        );
        pointer-events: none;
    }
`;
