import React from "react";
import styled from "styled-components";

// CSS
interface CSSProps {
    fontSize?: number;
}

const FlexRow = styled.div<CSSProps>`
    display: flex;
    align-items: center;
    justify-content: start;
`;

const SymbolSpan = styled.div.attrs((props: CSSProps) => {
    return {
        style: {
            marginLeft: props.fontSize / -10,
            marginRight: props.fontSize / -10,
        },
    };
})<CSSProps>`
    margin-left: -2px;
    margin-right: -2px;
`;

const SuperScript = styled.div.attrs((props: CSSProps) => {
    return {
        style: {
            fontSize: (props.fontSize * 2) / 3,
        },
    };
})<CSSProps>`
    vertical-align: "super";
    display: flex;
    justify-content: start;
    align-items: center;
`;

const StandardScript = styled.div.attrs((props: CSSProps) => {
    return {
        style: {
            fontSize: props.fontSize,
        },
    };
})<CSSProps>`
    display: flex;
    justify-content: start;
    align-items: center;
`;

interface Props {
    value: string;
    fontSize: number;
}

export const ChordSymbol: React.FC<Props> = ({ value, fontSize }) => {
    const cleanSymbol = (name: string, crumbFontSize: number) => {
        let crumbs: JSX.Element[] = [];
        let lastIndex = 0;
        for (var i = 0; i < name.length; i++) {
            if (name[i] === "♯" || name[i] === "♭") {
                crumbs.push(<span>{name.slice(lastIndex, i)}</span>);
                crumbs.push(
                    <SymbolSpan fontSize={crumbFontSize}>{name[i]}</SymbolSpan>
                );
                lastIndex = i + 1;
            }
        }
        crumbs.push(<span>{name.slice(lastIndex, i)}</span>);

        return crumbs;
    };

    const crumbs: JSX.Element[] = [];
    value.split("~~").forEach((chunk, i) =>
        chunk.split("__").forEach((crumb, j) => {
            const crumbFontSize = i === 0 ? fontSize : fontSize * 0.9;
            crumbs.push(
                j % 2 ? (
                    <SuperScript
                        key={`crumb-${crumb}-${i}-${j}`}
                        fontSize={crumbFontSize}
                    >
                        {cleanSymbol(crumb, crumbFontSize)}
                    </SuperScript>
                ) : (
                    <StandardScript
                        key={`crumb-${crumb}-${i}-${j}`}
                        fontSize={crumbFontSize}
                    >
                        {cleanSymbol(crumb, crumbFontSize)}
                    </StandardScript>
                )
            );
        })
    );

    return <FlexRow>{crumbs}</FlexRow>;
};
