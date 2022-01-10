import CSS from "csstype";
import styled from "styled-components";

// should extend from some CSSProp default object so you dont have to add these manually
interface CSSProps extends CSS.Properties {}

export const CircleControlsContainer = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    display: flex;
    align-items: center;
    justify-content: start;

    .circle-button-container {
        .circle-button {
            margin-left: -1px;
        }
    }

    .circle-button-container:first-child {
        .circle-button {
            border-top-left-radius: 100%;
            border-bottom-left-radius: 100%;
            margin-left: 0;
        }
    }

    .circle-button-container:last-child {
        .circle-button {
            border-top-right-radius: 100%;
            border-bottom-right-radius: 100%;
        }
    }
`;

export const Label = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    width: 30px;
    height: 8px;
    margin: 3px 5px;
    font-size: 9px;
    text-align: center;
`;
