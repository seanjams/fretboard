import React from "react";
import styled from "styled-components";

// CSS
interface CSSProps {
    fontSize?: number;
    width?: number;
    height?: number;
}

const FlexRow = styled.div.attrs((props: CSSProps) => ({
    style: {
        height: `${props.height}px`,
    },
}))<CSSProps>`
    display: flex;
    align-items: center;
    justify-content: start;
    flex-wrap: nowrap;
`;

const Spacer = styled.div.attrs((props: CSSProps) => {
    return {
        style: {
            width: `${props.width}px`,
        },
    };
})<CSSProps>``;

const SymbolSpan = styled.div.attrs((props: CSSProps) => ({
    style: {
        marginLeft: `${(props.fontSize || 0) / -8}px`,
        marginRight: `${(props.fontSize || 0) / -8}px`,
        height: `${props.fontSize}px`,
    },
}))<CSSProps>`
    vertical-align: top;
    font-size: 75%;
    white-space: nowrap;
`;

const SuperScript = styled.div.attrs((props: CSSProps) => ({
    style: {
        fontSize: `${props.fontSize}px`,
        height: `${props.fontSize}px`,
    },
}))<CSSProps>`
    vertical-align: "super";
    display: flex;
    justify-content: start;
    align-items: center;
    white-space: nowrap;
`;

const StandardScript = styled.div.attrs((props: CSSProps) => ({
    style: {
        fontSize: `${props.fontSize}px`,
    },
}))<CSSProps>`
    display: flex;
    justify-content: start;
    align-items: center;
    height: 100%;
    white-space: nowrap;
`;

interface Props {
    rootName: string;
    chordName: string;
    fontSize: number;
}

const cleanSymbol = (name: string, crumbFontSize: number) => {
    // cleans string passed.
    // If the string contains sharp/flat symbol, it wraps in sizing span
    let chunks: JSX.Element[] = [];
    let lastIndex = 0;
    for (var i = 0; i < name.length; i++) {
        if (name[i] === "♯" || name[i] === "♭") {
            chunks.push(
                <span key={`cr-${name[i]}-${i}`}>
                    {name.slice(lastIndex, i)}
                </span>
            );
            chunks.push(
                <SymbolSpan key={`sy-${name[i]}-${i}`} fontSize={crumbFontSize}>
                    {name[i]}
                </SymbolSpan>
            );
            lastIndex = i + 1;
        }
    }
    chunks.push(
        <span key={`cr-${name[i]}-${i}`}>{name.slice(lastIndex, i)}</span>
    );

    return chunks;
};

const generateCrumbs = (name: string, fontSize: number) => {
    // iterate over name and generate superscript/standardscript spans
    const crumbs: JSX.Element[] = [];
    const result: string[] = [];

    if (!name) return crumbs;

    name.split("__").forEach((crumb, j) => {
        const key = `crumb-${name}-${j}`;
        const superScriptFontSize = (fontSize * 2) / 3;

        crumbs.push(
            j % 2 ? (
                <SuperScript key={key} fontSize={superScriptFontSize}>
                    {cleanSymbol(crumb, superScriptFontSize)}
                </SuperScript>
            ) : (
                <StandardScript key={key} fontSize={fontSize}>
                    {cleanSymbol(crumb, fontSize)}
                </StandardScript>
            )
        );

        result.push(j % 2 ? "super" : "standard");
    });

    return crumbs;
};

export const ChordSymbol: React.FC<Props> = ({
    rootName,
    chordName,
    fontSize,
}) => {
    const rootNameCrumbs = generateCrumbs(rootName, fontSize);
    const chordNameCrumbs = generateCrumbs(chordName, fontSize);

    return (
        <FlexRow height={fontSize}>
            {rootNameCrumbs}
            {rootNameCrumbs.length && chordNameCrumbs.length ? (
                <Spacer width={fontSize / 4} />
            ) : null}
            {chordNameCrumbs}
        </FlexRow>
    );
};
