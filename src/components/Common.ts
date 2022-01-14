import CSS from "csstype";
import styled from "styled-components";

export interface CSSProps extends CSS.Properties {
    activeColor?: string;
    active?: boolean;
    diameter?: number;
}

export const Div = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
    },
}))<CSSProps>``;

export const Span = styled.span.attrs((props: CSSProps) => ({
    style: {
        ...props,
    },
}))<CSSProps>``;

export const FlexRow = styled.div.attrs((props: CSSProps) => ({
    style: { ...props },
}))<CSSProps>`
    display: flex;
    align-items: center;
    justify-content: center;
`;
