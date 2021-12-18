import CSS from "csstype";
import styled from "styled-components";
import { SP } from "../../utils";

interface CSSProps extends CSS.Properties {
    highlighted?: boolean;
}

export const AnimationWrapper = styled.div`
    .input-form {
        opacity: 0;
    }

    .input-fade-enter {
        opacity: 0;
    }
    .input-fade-enter-active {
        opacity: 1;
        transition: opacity 150ms ease;
    }
    .input-fade-enter-done {
        opacity: 1;
    }
    .input-fade-exit {
        opacity: 1;
    }
    .input-fade-exit-active {
        opacity: 0;
        transition: opacity 150ms ease;
    }
`;

export const ChordInputContainer = styled.div<CSSProps>`
    display: flex;
    flex-direction: column;
    align-items: start;
    width: 100%;
`;

export const FlexRow = styled.div.attrs((props: CSSProps) => ({
    style: {
        marginLeft: SP[2],
    },
}))<CSSProps>`
    display: flex;
    align-items: start;
    justify-content: flex-start;
`;

export const Title = styled.div.attrs((props: CSSProps) => ({
    style: {
        marginTop: SP[2],
        marginLeft: SP[2],
    },
}))<CSSProps>`
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
    flex-shrink: 0;
`;

export const OverflowContainerDiv = styled.div<CSSProps>`
    width: 100%;
    overflow-x: auto;
`;
