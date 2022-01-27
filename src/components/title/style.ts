import CSS from "csstype";
import styled from "styled-components";
import { lightGrey } from "../../utils";

interface CSSProps extends CSS.Properties {
    markerColor?: string;
}

export const TitleContainerDiv = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    font-family: Arial;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
`;

export const EmptyTitleContainerDiv = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    border: 4px dashed ${lightGrey};
    border-radius: 10px;
    width: 44px;
    height: calc(100% - 12px);
    margin: 0 auto;
`;

export const CurrentFretboardMarker = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    background-color: ${(props) => props.markerColor};
    border-radius: 100%;
    width: 12px;
    height: 12px;
    position: relative;
    top: -12px;
    transition: background-color 150ms ease-in-out;
`;
