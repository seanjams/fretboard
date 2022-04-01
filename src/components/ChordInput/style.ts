import CSS from "csstype";
import styled from "styled-components";
import { sandy, SAFETY_AREA_MARGIN, SP, mediumGrey } from "../../utils";

interface CSSProps extends CSS.Properties {
    highlighted?: boolean;
    wide?: boolean;
    size?: string;
}

export const ChordInputContainer = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    height: 100%;
    width: 100%;

    .label-container,
    .chord-scale-container {
        display: flex;
        width: calc(100% - ${2 * SAFETY_AREA_MARGIN}px);
        padding-left: ${SAFETY_AREA_MARGIN}px;
        padding-right: ${SAFETY_AREA_MARGIN}px;
    }

    .label-container {
        height: 10%;
        font-size: 10px;
        color: ${mediumGrey};

        div:first-child {
            width: calc(40% - ${SP[1]}px);
            padding-left: ${SP[1]}px;
            transform: translateY(-${SP[0]}px);
        }

        div:last-child {
            width: calc(60% - ${SP[6]}px);
            padding-left: ${SP[6]}px;
            transform: translateY(-${SP[0]}px);
        }
    }

    .chord-scale-container {
        height: 90%;
    }
`;

// This is the staggered root selector in the ChordInput component

export const RootContainer = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
    },
}))<CSSProps>`
    height: 100%;
    width: 40%;
`;

export const RootTag = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
        backgroundColor: props.highlighted ? sandy : "white",
    },
}))<CSSProps>`
    height: calc(100% - ${3 * SP[0]}px);
    flex-grow: 1;
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: ${SP[0]}px ${SP[1]}px;
    padding: ${SP[0] / 2}px;
    font-size: 11px;
    border-radius: 999999px;
    transition: border 150ms ease-in-out;
    box-shadow: 0 0 4px 0 #aaa;
    z-index: 0;
`;

// This is the scrollable chord selector in the ChordInput component
export const ChordScaleContainer = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
    },
}))<CSSProps>`
    height: 100%;
    width: calc(60% - ${SP[6]}px);
    margin-left: ${SP[6]}px;
`;
