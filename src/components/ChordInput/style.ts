import CSS from "csstype";
import styled from "styled-components";
import {
    lighterGrey,
    mediumGrey,
    sandy,
    SP,
    standardBoxShadow,
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
    display: flex;
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
        backgroundColor: props.highlighted ? sandy : lighterGrey,
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
    box-shadow: ${standardBoxShadow()};
    z-index: 0;
`;

// This is the scrollable chord selector in the ChordInput component
export const ChordScaleContainer = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
    },
}))<CSSProps>`
    height: 100%;
    width: calc(60% - ${SP[7]}px);
    margin-left: ${SP[7]}px;
`;
