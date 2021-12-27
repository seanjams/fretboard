import CSS from "csstype";
import styled from "styled-components";
import { SP } from "../../utils";

// CSS
interface CSSProps extends CSS.Properties {
    legendTop?: boolean;
    fretBorder?: string;
}

export const FretDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
        borderLeft: props.fretBorder,
        borderRight: props.fretBorder,
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
        ...props,
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
        ...props,
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
        ...props,
        height: props.height,
        backgroundColor: props.backgroundColor,
    },
}))<CSSProps>`
    width: calc(50% - 13px);
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
    background-color: #000;
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
    background-color: #000;
    margin-top: -${SP[0] / 2}px;
`;
