import CSS from "csstype";
import styled from "styled-components";
import { mediumGrey, SP } from "../../utils";

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
    height: 44px;
`;

export const EmptyTitleContainerDiv = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    border: 3px dashed ${mediumGrey};
    border-radius: 10px;
    box-sizing: border-box;
    width: 80px;
    height: 100%;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${mediumGrey};
    font-size: ${titleFontSize}px;
`;

export const CurrentFretboardMarker = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    position: relative;
    top: -${SP[4]}px;
    background-color: ${(props) => props.markerColor};
    border-radius: 100%;
    width: ${SP[2]}px;
    height: ${SP[2]}px;
    margin-bottom: -${SP[2]}px;
    transition: background-color 150ms ease-in-out;
`;
