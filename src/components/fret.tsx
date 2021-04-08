import * as React from "react";
import styled from "styled-components";
import { FretboardContext } from "../store";
import { NOTE_COLORS } from "../consts";
import { NoteUtil, mod } from "../utils";
import { ModeTypes } from "../types";

// CSS
interface CSSProps {
    border?: string;
    backgroundColor?: string;
    height?: string;
    width?: string;
    color?: string;
}

const FretDiv = styled.div<CSSProps>`
    border: ${({ border }) => border};
    height: 40px;
    width: 8.333333%;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const CircleDiv = styled.div<CSSProps>`
    border: 1px solid #333;
    color: #333;
    display: flex;
    justify-content: center;
    align-items: center;
    width: ${({ width }) => width || "30px"};
    height: ${({ height }) => height || "30px"};
    border-radius: 100%;
    background-color: ${({ backgroundColor }) => backgroundColor};
`;

const ColoredText = styled.span<CSSProps>`
    font-size: 20px;
    padding: 0 10px;
    color: ${({ color }) => color};
`;

// Component
interface Props {
    value: number;
    stringIndex: number;
    openString?: boolean;
}

export const Fret: React.FC<Props> = ({ value, openString, stringIndex }) => {
    const { state, dispatch } = React.useContext(FretboardContext);

    const note = new NoteUtil(value);

    function getLabel(label?: string | undefined) {
        if (state.mode === "Relationship") {
            return label;
        } else {
            return state.label === "value" ? value : note.getName(state.label);
        }
    }

    function getBackgroundColor() {
        const backgroundColor = state.fretboard.getFret(stringIndex, value)
            ? "#a36"
            : state.fretboard.get(value)
            ? "#3c6"
            : "transparent";
        return backgroundColor;
    }

    const getFretUtils: { [key in ModeTypes]: any } = {
        Relationship: {
            getOnClick: function (
                e: React.MouseEvent<HTMLDivElement, MouseEvent>
            ): any {
                e.preventDefault();
                // change to space + click
                // and also add button for toggle
                dispatch({
                    type: "SET_HIGHLIGHTED_NOTE",
                    payload: { stringIndex, value },
                });
            },
            getContent: () => {
                // Add colored numbers based on root. Add circled number for root
                // For each highlighted note, set a unique background color. Then for each of these
                const items = [];
                const { fretboard } = state;
                const backgroundColor = NOTE_COLORS[mod(value, 12)];

                if (fretboard.getFret(stringIndex, value)) {
                    items.push(
                        <CircleDiv
                            width="15px"
                            height="15px"
                            backgroundColor={backgroundColor}
                        >
                            {getLabel()}
                        </CircleDiv>
                    );
                }

                const intervalMap: { [key in number]: number } = {
                    1: 1,
                    2: 9,
                    3: 3,
                    4: 11,
                    5: 5,
                    6: 13,
                    7: 7,
                };

                for (let highlightedNote of fretboard.listFrets()) {
                    let label;
                    fretboard
                        .getDiatonicKey(highlightedNote)
                        .forEach((note, i) => {
                            if (i === 0 || i % 2) return;
                            const interval = i % 2 ? i + 8 : i + 1;
                            if (mod(value, 12) === mod(note, 12)) {
                                label = interval;
                                return false;
                            }
                        });

                    if (label) {
                        items.push(
                            <ColoredText color={NOTE_COLORS[highlightedNote]}>
                                {label}
                            </ColoredText>
                        );
                    }
                }

                return items;
            },
        },
        Pattern: {
            getOnClick: function (
                e: React.MouseEvent<HTMLDivElement, MouseEvent>
            ): any {
                e.preventDefault();
                // change to space + click
                // and also add button for toggle
                dispatch({
                    type: "SET_HIGHLIGHTED_NOTE",
                    payload: { stringIndex, value },
                });
            },
            getContent: () => {
                return (
                    <CircleDiv backgroundColor={getBackgroundColor()}>
                        {getLabel()}
                    </CircleDiv>
                );
            },
        },
    };

    const { getOnClick, getContent } = getFretUtils[state.mode];

    return (
        <FretDiv
            border={openString ? "none" : "1px solid #333"}
            onClick={getOnClick}
        >
            {getContent()}
        </FretDiv>
    );
};
