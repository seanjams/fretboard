import CSS from "csstype";
import styled from "styled-components";
import { SP, lightGrey } from "../../utils";

// CSS
interface CSSProps extends CSS.Properties {
    legendTop?: boolean;
    animationBackground?: string;
    isOpenString?: boolean;
    circleSize?: number;
}

export const FretDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
        borderLeft: props.isOpenString ? "none" : `1px solid ${lightGrey}`,
        borderRight: props.isOpenString ? "none" : `1px solid ${lightGrey}`,
    },
}))<CSSProps>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    height: 100%;

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
    margin-left: -${(props) => (props.circleSize || 0) / 2}px;
    margin-right: -${(props) => (props.circleSize || 0) / 2}px;
    width: ${(props) => props.circleSize || 0}px;
    height: ${(props) => props.circleSize || 0}px;
    border-radius: 100%;
    box-sizing: border-box;
    color: ${lightGrey};
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    z-index: 9999;
    touch-action: none;
    box-shadow: 0 0 4px 0 #aaa;

    // &:hover {
    //     background: linear-gradient(#e9e9e9, #f9f9f9);
    // }
`;

export const ShadowDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
    },
}))<CSSProps>`
    margin-left: -${(props) => (props.circleSize || 0) / 2}px;
    margin-right: -${(props) => (props.circleSize || 0) / 2}px;
    width: ${(props) => props.circleSize || 0}px;
    height: ${(props) => props.circleSize || 0}px;
    border-radius: 100%;
    z-index: 9998;
    position: absolute;
    left: 50%;
    // box-shadow: 0 0 4px 0 #aaa;

    // box-shadow: inset 0px 1px 0px 0px rgba(255, 255, 255, 0);
    // text-shadow: inset 0px 1px 0px rgba(255, 255, 255, 0);
    // background: linear-gradient(rgba(255, 255, 255, 0), rgba(220, 220, 220, 1));
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

export const FretNumber = styled.div<CSSProps>`
    position: relative;
    left: 0px;
    top: ${-SP[1] - 2}px;
    height: ${SP[1]}px;
    text-align: center;
    margin-bottom: ${-SP[1]}px;
    font-size: ${SP[1]}px;
    color: ${lightGrey};
`;
