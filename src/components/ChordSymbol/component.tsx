import React from "react";
import { Div, FlexRow } from "../Common";
import { StandardScript, SuperScript, SymbolSpan } from "./style";

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
                <SymbolSpan
                    key={`sy-${name[i]}-${i}`}
                    scriptFontSize={crumbFontSize}
                >
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
                <SuperScript key={key} scriptFontSize={superScriptFontSize}>
                    {cleanSymbol(crumb, superScriptFontSize)}
                </SuperScript>
            ) : (
                <StandardScript key={key} scriptFontSize={fontSize}>
                    {cleanSymbol(crumb, fontSize)}
                </StandardScript>
            )
        );

        result.push(j % 2 ? "super" : "standard");
    });

    return crumbs;
};

interface ChordSymbolProps {
    rootName: string;
    chordName: string;
    fontSize: number;
}

export const ChordSymbol: React.FC<ChordSymbolProps> = ({
    rootName,
    chordName,
    fontSize,
}) => {
    let rootNameCrumbs =
        chordName === "Chromatic" ? [] : generateCrumbs(rootName, fontSize);
    const chordNameCrumbs = generateCrumbs(chordName, fontSize);

    return (
        <FlexRow flexWrap="nowrap" justifyContent="start">
            {rootNameCrumbs}
            {rootNameCrumbs.length && chordNameCrumbs.length ? (
                <Div width={`${fontSize / 4}px`} />
            ) : null}
            {chordNameCrumbs}
        </FlexRow>
    );
};
