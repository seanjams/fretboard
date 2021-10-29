import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import { StateType } from "../types";
import {
    getCurrentProgression,
    getCurrentFretboard,
    getName,
    getNotes,
} from "../utils";
import { Store } from "../store";
import { ChordSymbol } from "./symbol";

// CSS
interface CSSProps {}

const TitleContainerDiv = styled.div<CSSProps>`
    padding: 10px 10px 0px 20px;
    font-family: Arial;
    height: 28px;
    vertical-align: top;
`;

// Component
interface Props {
    store: Store<StateType>;
}

export const Title: React.FC<Props> = ({ store }) => {
    const { label } = getCurrentProgression(store.state);
    const fretboard = getCurrentFretboard(store.state);

    const [name, setName] = useState(getName(getNotes(fretboard), label));
    const nameRef = useRef(name);
    nameRef.current = name;

    const [rootIdx, rootName, chordName, chordNotes] = name;

    useEffect(() => {
        return store.addListener((newState) => {
            const { label } = getCurrentProgression(newState);
            const fretboard = getCurrentFretboard(newState);
            const newName = getName(getNotes(fretboard), label);
            if (newName !== nameRef.current) {
                setName(newName);
            }
        });
    }, []);

    // fix these parameters

    // x = 39, s = 13
    // x = 18, s = 28

    // y - 13 = (-15 / 21) ( x - 39)
    // y -12x + 481

    const x0 = 10;
    const y0 = 28;
    const x1 = 37;
    const y1 = 12;
    const buffer = 0;

    const fontSize =
        name.length < x0
            ? y0
            : name.length > x1
            ? y1
            : ((y0 - y1 + buffer) / (x0 - x1)) * (name.length - x1) + y1;

    const onClick = () => {
        return store.reducers.setShowInput(!store.state.showInput);
    };

    return (
        <TitleContainerDiv onClick={onClick} onTouchStart={onClick}>
            <ChordSymbol
                rootName={rootName}
                chordName={chordName || chordNotes || ""}
                fontSize={fontSize}
            />
        </TitleContainerDiv>
    );
};
