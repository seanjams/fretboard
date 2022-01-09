import CSS from "csstype";
import styled from "styled-components";

interface CSSProps extends CSS.Properties {
    lockScroll?: boolean;
}

export const ContainerDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
    },
}))<CSSProps>`
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100vh;
    width: 100vw;
    // align-items: center;
    font-family: Arial;
    overflow: hidden;
`;

export const DashboardContainerDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
    },
}))<CSSProps>``;

export const FlexContainerDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
    },
}))<CSSProps>``;

export const FlexRow = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    display: flex;
    justify-content: space-evenly;
`;
