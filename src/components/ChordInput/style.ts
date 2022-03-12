import CSS from "csstype";
import styled from "styled-components";
import {
    sandy,
    lighterGrey,
    lightGrey,
    SAFETY_AREA_MARGIN,
    SP,
} from "../../utils";

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
        color: ${lightGrey};

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

export const RootContainer = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
    },
}))<CSSProps>`
    height: 100%;
    width: 40%;
`;

export const ChordScaleContainer = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
    },
}))<CSSProps>`
    height: 100%;
    width: 60%;
    position: relative;
    top: 0;
    left: 0;

    .overflow-container {
        position: absolute;
        top: 0;
        left: 0;
        width: calc(100% - ${SP[6]}px);
        height: calc(100% - ${2 * SP[0]}px);

        margin-top: ${SP[0]}px;
        margin-bottom: ${SP[0]}px;
        margin-left: ${SP[6]}px;
        border-radius: 999999px;
    }
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

export const ShadowOverlay = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    z-index: 9999;
    box-shadow: inset 0 0 4px 0 #777;
    pointer-events: none;
`;

export const OverflowContainerDiv = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    overflow-x: auto;
    background-color: ${lighterGrey};
`;

export const ChordScaleTag = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
        backgroundColor: props.highlighted ? sandy : "transparent",
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
