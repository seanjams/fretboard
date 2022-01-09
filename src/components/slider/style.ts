import CSS from "csstype";
import styled from "styled-components";
import { darkGrey } from "../../utils";

// CSS
interface CSSProps extends CSS.Properties {
    isFirst?: boolean;
    isLast?: boolean;
    show?: boolean;
    fragmentWidth?: number;
    minSliderSize?: number;
    maxSliderSize?: number;
}

export const ContainerDiv = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const ProgressBar = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    display: flex;
    align-items: center;
    justify-content: center;
    touch-action: none;
`;

export const ProgressBarFragment = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
        width: `calc(${props.width} - ${
            props.isFirst || props.isLast ? "10" : "0"
        }px)`,
        borderLeft: `${props.isFirst ? `1px solid ${darkGrey}` : "0"}`,
        borderTopLeftRadius: `${props.isFirst ? "100000000000000px" : "0"}`,
        borderBottomLeftRadius: `${props.isFirst ? "100000000000000px" : "0"}`,
        borderTopRightRadius: `${props.isLast ? "100000000000000px" : "0"}`,
        borderBottomRightRadius: `${props.isLast ? "100000000000000px" : "0"}`,
        marginLeft: `${props.isFirst ? "10px" : "0"}`,
        marginRight: `${props.isLast ? "10px" : "0"}`,
    },
}))<CSSProps>`
    height: 10px;
    background-color: white;
    border: 1px solid ${darkGrey};
    color: ${darkGrey};
    touch-action: none;
    margin: 10px 0;
`;

export const SliderBar = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
        backgroundColor: props.show ? "red" : "transparent",
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
`;

export const ProgressBarName = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    position: relative;
    bottom: 16px;
    padding-left: 6px;
    font-size: 12px;
`;

export const AnimationWrapper = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    height: ${(props) => props.maxSliderSize}px;
    display: flex;
    align-items: center;

    .slider-bar {
        height: ${(props) => props.minSliderSize}px;
        width: ${(props) => props.minSliderSize}px;
    }

    .slider-grow-enter {
        height: ${(props) => props.minSliderSize}px;
        width: ${(props) => props.minSliderSize}px;
    }
    .slider-grow-enter-active {
        height: ${(props) => props.maxSliderSize}px;
        width: ${(props) => props.maxSliderSize}px;
        transition: all 150ms ease;
    }
    .slider-grow-enter-done {
        height: ${(props) => props.maxSliderSize}px;
        width: ${(props) => props.maxSliderSize}px;
    }
    .slider-grow-exit {
        height: ${(props) => props.maxSliderSize}px;
        width: ${(props) => props.maxSliderSize}px;
    }
    .slider-grow-exit-active {
        height: ${(props) => props.minSliderSize}px;
        width: ${(props) => props.minSliderSize}px;
        transition: all 150ms ease;
    }
`;
