import CSS from "csstype";
import styled from "styled-components";
import { CIRCLE_SIZE, lightGrey, SAFETY_AREA_MARGIN, SP } from "../../utils";

interface CSSProps extends CSS.Properties {
    highlighted?: boolean;
    wide?: boolean;
}

export const ChordInputContainer = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    display: flex;
    flex-direction: column;
    align-items: start;
    width: calc(100% - ${2 * SAFETY_AREA_MARGIN}px);
    height: calc(100% - ${SP[1]}px);
    padding-left: ${SAFETY_AREA_MARGIN}px;
    padding-right: ${SAFETY_AREA_MARGIN}px;
    padding-bottom: ${SP[1]}px;
`;

export const Label = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    font-size: 14px;
    text-align: right;
    line-height: ${CIRCLE_SIZE}px;
`;

export const Tag = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
        // border: props.highlighted ? "2px solid #000" : "2px solid transparent",
        boxShadow: props.highlighted
            ? "0 0 4px 0 #aaa"
            : "0px 0px 0px 0px transparent",
        paddingLeft: `${props.wide ? (CIRCLE_SIZE - 4) / 2 : 2}px`,
        paddingRight: `${props.wide ? (CIRCLE_SIZE - 4) / 2 : 2}px`,
    },
}))<CSSProps>`
    margin: 2px 8px;
    border-radius: ${CIRCLE_SIZE - 4}px;
    min-width: ${CIRCLE_SIZE - 4}px;
    min-height: ${CIRCLE_SIZE - 4}px;
    font-size: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 2px;
    padding-bottom: 2px;
    flex-shrink: 0;
    transition: border 150ms ease-in-out;
`;

export const OverflowContainerDiv = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    position: relative;
    z-index: 999;

    &:before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: ${3 * SP[4]}px;
        background-image: linear-gradient(
            to left,
            rgba(255, 255, 255, 0),
            white 85%
        );
        pointer-events: none;
    }

    &:after {
        content: "";
        position: absolute;
        bottom: 0;
        top: 0;
        right: 0;
        width: ${3 * SP[4]}px;
        background-image: linear-gradient(
            to right,
            rgba(255, 255, 255, 0),
            white 85%
        );
        pointer-events: none;
    }

    & > div {
        width: 100%;
        overflow-x: auto;
    }
`;
