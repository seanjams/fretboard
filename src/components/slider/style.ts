import CSS from "csstype";
import styled from "styled-components";
import { darkGrey } from "../../utils";

// CSS
interface CSSProps extends CSS.Properties {
    isFirst?: boolean;
    isLast?: boolean;
}

export const ProgressBar = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    display: flex;
    align-items: center;
    justify-content: center;
    touch-action: none;
`;

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
    color: ${darkGrey};
    opacity: 0.5;
    touch-action: none;
    border-radius: 100000000000000px;
    background-color: transparent;
`;
