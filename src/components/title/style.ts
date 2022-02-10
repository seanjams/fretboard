import CSS from "csstype";
import styled from "styled-components";
import { lighterGrey, SP } from "../../utils";

interface CSSProps extends CSS.Properties {
    markerColor?: string;
}

export const titleFontSize = 24;

export const TitleContainerDiv = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    font-family: Arial;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
`;

export const EmptyTitleContainerDiv = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    border: 4px dashed ${lighterGrey};
    border-radius: 10px;
    box-sizing: border-box;
    width: 80px;
    height: 100%;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${lighterGrey};
    font-size: ${titleFontSize - 10}px;
`;

export const CurrentFretboardMarker = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    background-color: ${(props) => props.markerColor};
    border-radius: 100%;
    width: 12px;
    height: 12px;
    position: relative;
    top: -${SP[3]}px;
    transition: background-color 150ms ease-in-out;
`;
