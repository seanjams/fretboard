import CSS from "csstype";
import styled from "styled-components";

// CSS
interface CSSProps extends CSS.Properties {
    scriptFontSize?: number;
}

export const SymbolSpan = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
        marginLeft: `${((props.scriptFontSize || 0) * 1.5) / -8}px`,
        marginRight: `${(props.scriptFontSize || 0) / -8}px`,
        height: `${props.scriptFontSize}px`,
    },
}))<CSSProps>`
    font-size: 75%;
    white-space: nowrap;
`;

export const SuperScript = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
        fontSize: `${props.scriptFontSize}px`,
        height: `${props.scriptFontSize}px`,
    },
}))<CSSProps>`
    vertical-align: "super";
    display: flex;
    justify-content: start;
    align-items: center;
    white-space: nowrap;
`;

export const StandardScript = styled.div.attrs((props: CSSProps) => ({
    style: {
        ...props,
        fontSize: `${props.scriptFontSize}px`,
    },
}))<CSSProps>`
    display: flex;
    justify-content: start;
    align-items: center;
    height: 100%;
    white-space: nowrap;
`;
