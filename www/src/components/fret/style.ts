import CSS from "csstype";
import styled from "styled-components";
import { SP } from "../../utils";

// CSS
interface CSSProps extends CSS.Properties {
    legendTop?: boolean;
    minFretHeight?: number;
    maxFretHeight?: number;
}

export const FretDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        borderLeft: props.border,
        borderRight: props.border,
        width: props.width,
        height: props.height,
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
`;

export const CircleDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        color: props.color,
    },
}))<CSSProps>`
    margin-left: -13px;
    margin-right: -13px;
    border: 1px solid #333;
    box-sizing: border-box;
    color: #333;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 26px;
    height: 26px;
    border-radius: 100%;
    background-color: transparent;
    z-index: 9999;
`;

export const ShadowDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        left: props.left,
        top: props.top,
        width: props.width,
        backgroundColor: props.backgroundColor,
    },
}))<CSSProps>`
    margin-left: -13px;
    margin-right: -13px;
    width: 26px;
    height: 26px;
    border-radius: 100%;
    z-index: 9998;
    position: absolute;
`;

export const StringSegmentDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        height: props.height,
        backgroundColor: props.backgroundColor,
    },
}))<CSSProps>`
    width: calc(50% - 13px);
    margin: auto 0;
`;

export const LegendDot = styled.div.attrs((props: CSSProps) => ({
    style: {
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
    background-color: #000;
    margin-top: -${SP[0] / 2}px;
`;

export const OctaveDot = styled.div.attrs((props: CSSProps) => ({
    style: {
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
    background-color: #000;
    margin-top: -${SP[0] / 2}px;
`;

export const AnimationWrapper = styled.div<CSSProps>`
    height: 100%;

    .fret-container {
        max-height: ${(props) => props.maxFretHeight}px;
        height: 100%;
    }

    .fret-shrink-enter {
        max-height: ${(props) => props.maxFretHeight}px;
    }
    .fret-shrink-enter-active {
        max-height: ${(props) => props.minFretHeight}px;
        transition: max-height 150ms;
    }
    .fret-shrink-enter-done {
        max-height: ${(props) => props.minFretHeight}px;
    }
    .fret-shrink-exit {
        max-height: ${(props) => props.minFretHeight}px;
    }
    .fret-shrink-exit-active {
        max-height: ${(props) => props.maxFretHeight}px;
        transition: max-height 150ms;
    }
`;
