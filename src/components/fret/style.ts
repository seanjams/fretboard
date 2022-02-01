import CSS from "csstype";
import styled from "styled-components";
import { CIRCLE_SIZE, SP, lightGrey, FRETBOARD_MARGIN } from "../../utils";

// CSS
interface CSSProps extends CSS.Properties {
    legendTop?: boolean;
    animationBackground?: string;
    isOpenString?: boolean;
    isTop?: boolean;
    isBottom?: boolean;
}

export const FretDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
        borderLeft: props.isOpenString ? "none" : `1px solid ${lightGrey}`,
        borderRight: props.isOpenString ? "none" : `1px solid ${lightGrey}`,
        marginTop: `${props.isTop ? FRETBOARD_MARGIN : 0}px`,
        marginBottom: `${props.isBottom ? FRETBOARD_MARGIN : 0}px`,
        height: `calc(100% - ${
            props.isTop || props.isBottom ? FRETBOARD_MARGIN : 0
        }px)`,
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

    // .fret-animation {
    //     background: ${(props) => props.animationBackground};
    //     transition: background 150ms ease-in-out;
    // }
`;

export const CircleDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
    },
}))<CSSProps>`
    margin-left: -${CIRCLE_SIZE / 2}px;
    margin-right: -${CIRCLE_SIZE / 2}px;
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
    box-shadow: 0px 0px 4px 0px #aaa;

    // &:hover {
    //     background: linear-gradient(#e9e9e9, #f9f9f9);
    // }
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
    left: 50%;

    // box-shadow: inset 0px 1px 0px 0px rgba(255, 255, 255, 0);
    // text-shadow: inset 0px 1px 0px rgba(255, 255, 255, 0);
    // background: linear-gradient(rgba(255, 255, 255, 0), rgba(220, 220, 220, 1));
`;

export const StringSegmentDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
    },
}))<CSSProps>`
    width: calc(50% - ${CIRCLE_SIZE / 2}px);
    margin: auto 0;
    // box-shadow: 0px 2px 8px 0px #aaa;
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
