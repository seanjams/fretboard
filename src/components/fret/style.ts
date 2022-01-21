import CSS from "csstype";
import styled from "styled-components";
import { CIRCLE_SIZE, SP, darkGrey, lightGrey } from "../../utils";

// CSS
interface CSSProps extends CSS.Properties {
    legendTop?: boolean;
    fretBorder?: string;
    animationBackground?: string;
}

export const FretDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
    },
}))<CSSProps>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    user-select: none; /* standard syntax */
    -webkit-user-select: none; /* webkit (safari, chrome) browsers */
    -moz-user-select: none; /* mozilla browsers */
    -khtml-user-select: none; /* webkit (konqueror) browsers */
    -ms-user-select: none; /* IE10+ */

    .fret-animation {
        background: ${(props) => props.animationBackground};
        transition: background 150ms ease-in-out;
    }
`;

export const CircleDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
    },
}))<CSSProps>`
    margin-left: -${CIRCLE_SIZE / 2}px;
    margin-right: -${CIRCLE_SIZE / 2}px;
    border: 1px solid ${lightGrey};
    box-sizing: border-box;
    color: ${lightGrey};
    display: flex;
    justify-content: center;
    align-items: center;
    width: ${CIRCLE_SIZE}px;
    height: ${CIRCLE_SIZE}px;
    border-radius: 100%;
    background-color: transparent;
    z-index: 9999;
    touch-action: none;
`;

export const ShadowDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
    },
}))<CSSProps>`
    margin-left: -${CIRCLE_SIZE / 2}px;
    margin-right: -${CIRCLE_SIZE / 2}px;
    width: ${CIRCLE_SIZE}px;
    height: ${CIRCLE_SIZE}px;
    border-radius: 100%;
    z-index: 9998;
    position: absolute;
`;

export const StringSegmentDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
    },
}))<CSSProps>`
    width: calc(50% - ${CIRCLE_SIZE / 2}px);
    margin: auto 0;
`;

export const LegendDot = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
        top: props.legendTop
            ? `${2 + SP[0] / 2}px`
            : `calc(100% - ${2 + SP[0] / 2}px)`,
    },
}))<CSSProps>`
    left: calc(100% - ${(SP[0] * 3) / 2}px);
    width: ${SP[0]}px;
    height: ${SP[0]}px;
    border-radius: 100%;
    position: absolute;
    background-color: ${lightGrey};
    margin-top: -${SP[0] / 2}px;
`;

export const OctaveDot = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
        left: `calc(100% - ${(SP[0] * 3) / 2}px)`,
        top: props.legendTop
            ? `${2 + 2 * SP[0]}px`
            : `calc(100% - ${2 + 2 * SP[0]}px)`,
    },
}))<CSSProps>`
    width: ${SP[0]}px;
    height: ${SP[0]}px;
    border-radius: 100%;
    position: absolute;
    background-color: ${lightGrey};
    margin-top: -${SP[0] / 2}px;
`;
