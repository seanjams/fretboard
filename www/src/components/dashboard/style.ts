import CSS from "csstype";
import styled from "styled-components";
import { SAFETY_AREA_MARGIN, FRETBOARD_MARGIN } from "../../utils";

interface CSSProps extends CSS.Properties {}

export const ContainerDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        width: props.width,
        height: props.height,
    },
}))<CSSProps>`
    font-family: Arial;
    overflow: hidden;
    width: 100vw;
`;

export const FlexContainerDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        height: props.height,
        marginTop: props.marginTop || 0,
        marginBottom: props.marginBottom || 0,
    },
}))<CSSProps>``;

export const OverflowContainerDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        height: props.height,
    },
}))<CSSProps>`
    width: 100%;
    overflow-x: auto;
    margin: ${FRETBOARD_MARGIN}px 0;
`;

export const FlexRow = styled.div.attrs((props: CSSProps) => ({
    style: {
        alignItems: props.alignItems || "start",
    },
}))<CSSProps>`
    display: flex;
    justify-content: space-evenly;
    padding: 0 ${SAFETY_AREA_MARGIN}px;
`;
