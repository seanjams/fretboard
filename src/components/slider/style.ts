import CSS from "csstype";
import styled from "styled-components";
import { darkGrey, SP } from "../../utils";

// CSS
interface CSSProps extends CSS.Properties {
    isFirst?: boolean;
    isLast?: boolean;
}

// slider container, contains segments for different fretboards
export const ProgressBar = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    display: flex;
    align-items: start;
    justify-content: center;
    touch-action: none;
    width: 100%;
    height: 100%;

    user-select: none; /* standard syntax */
    -webkit-user-select: none; /* webkit (safari, chrome) browsers */
    -moz-user-select: none; /* mozilla browsers */
    -khtml-user-select: none; /* webkit (konqueror) browsers */
    -ms-user-select: none; /* IE10+ */
`;

// invisible touch area of slider
export const SliderBar = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
    },
}))<CSSProps>`
    position: absolute;
    z-index: 10001;
    display: flex;
    align-items: center;
    justify-content: center;
    touch-action: none;
    background-color: transparent;

    user-select: none; /* standard syntax */
    -webkit-user-select: none; /* webkit (safari, chrome) browsers */
    -moz-user-select: none; /* mozilla browsers */
    -khtml-user-select: none; /* webkit (konqueror) browsers */
    -ms-user-select: none; /* IE10+ */
`;

// circular marker on top of touch area for visual reference
export const SliderMarker = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    position: relative;
    top: -${SP[10]}px;
    background-color: ${darkGrey};
    border-radius: 100%;
    width: ${SP[2]}px;
    height: ${SP[2]}px;
    margin-bottom: -${SP[2]}px;
    transition: background-color 150ms ease-in-out;
`;
