import CSS from "csstype";
import styled from "styled-components";
import { lighterGrey, sandy, SP, standardBoxShadow } from "../../utils";

interface CSSProps extends CSS.Properties {
    selected?: boolean;
}

export const SelectorContainer = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
    },
}))<CSSProps>`
    height: 100%;
    width: 100%;
    position: relative;
    top: 0;
    left: 0;

    .overflow-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: calc(100% - ${2 * SP[0]}px);
        margin-top: ${SP[0]}px;
        margin-bottom: ${SP[0]}px;
        border-radius: 999999px;
    }
`;

export const OverflowContainerDiv = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    overflow-x: auto;
    overflow-y: hidden;
    background-color: ${lighterGrey};
`;

export const ShadowOverlay = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    z-index: 9999;
    box-shadow: ${standardBoxShadow(true)};
    pointer-events: none;
`;

export const SelectorOption = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
        backgroundColor: props.selected ? sandy : "transparent",
    },
}))<CSSProps>`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    height: 100%;
    padding: 0 ${SP[4]}px;
    z-index: 0;
`;
