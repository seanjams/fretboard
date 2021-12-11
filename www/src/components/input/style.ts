import CSS from "csstype";
import styled from "styled-components";

interface CSSProps extends CSS.Properties {
    highlighted?: boolean;
}

export const ChordInputContainer = styled.div<CSSProps>`
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    width: 100%;
`;

export const FlexRow = styled.div<CSSProps>`
    display: flex;
    align-items: start;
    justify-content: flex-start;
`;

export const Title = styled.div<CSSProps>`
    font-size: 14px;
`;

export const Tag = styled.div.attrs((props: CSSProps) => ({
    style: {
        border: props.highlighted ? "2px solid #000" : "2px solid transparent",
    },
}))<CSSProps>`
    margin: 4px 8px 4px 0;
    border-radius: 4px;
    min-width: 26px;
    min-height: 14px;
    font-size: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
`;
