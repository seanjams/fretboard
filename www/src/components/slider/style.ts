import CSS from "csstype";
import styled from "styled-components";

// CSS
interface CSSProps extends CSS.Properties {
    isFirst?: boolean;
    isLast?: boolean;
    show?: boolean;
    fragmentWidth?: number;
}

export const ContainerDiv = styled.div<CSSProps>`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const ProgressBar = styled.div.attrs((props: CSSProps) => ({
    style: {
        width: props.width,
    },
}))<CSSProps>`
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    touch-action: none;
`;

export const ProgressBarFragment = styled.div.attrs((props: CSSProps) => ({
    style: {
        width: `calc(${props.width} - ${
            props.isFirst || props.isLast ? "10" : "0"
        }px)`,
        borderLeft: `${props.isFirst ? "1px solid #333" : "0"}`,
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
    border: 1px solid #333;
    color: #333;
    touch-action: none;
    margin: 10px 0;
`;

export const SliderBar = styled.div.attrs((props: CSSProps) => ({
    style: {
        left: props.left,
        backgroundColor: props.show ? "red" : "transparent",
    },
}))<CSSProps>`
    height: 30px;
    width: 30px;
    position: absolute;
    z-index: 10001;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    color: #333;
    opacity: 0.5;
    touch-action: none;
    border-radius: 100000000000000px;
`;

export const ProgressBarName = styled.div<CSSProps>`
    position: relative;
    top: 14px;
    padding-left: 6px;
    font-size: 12px;
`;
