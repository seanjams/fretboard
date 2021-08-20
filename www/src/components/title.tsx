import React, { useRef, useState, useEffect } from "react";
import styled from "styled-components";
import { StateType, Store, ActionTypes, useStore, useStateRef } from "../store";
import { ChordSymbol } from "./symbol";
import { isEqual } from "lodash";

// CSS
interface CSSProps {}

const TitleContainerDiv = styled.div<CSSProps>`
    padding: 10px 0px 0px 30px;
    font-family: Arial;
    height: 28px;
`;

// Component
interface Props {
    store: Store<StateType, ActionTypes>;
}

export const Title: React.FC<Props> = ({ store }) => {
    const [state, setState] = useStore(store);
    const { fretboards, focusedIndex, label, showInput } = state;
    const fretboard = fretboards[focusedIndex];
    const [name, setName] = useState(fretboard.getName(label));
    const notesRef = useRef(fretboard.notes);
    const labelRef = useRef(label);
    const showInputRef = useRef(showInput);

    useEffect(() => {
        store.addListener(({ focusedIndex, fretboards, label, showInput }) => {
            if (
                !isEqual(fretboards[focusedIndex].notes, notesRef.current) ||
                label !== labelRef.current
            ) {
                setName(fretboards[focusedIndex].getName(label));
                notesRef.current = fretboards[focusedIndex].notes;
                labelRef.current = label;
            }
            if (showInput !== showInputRef.current)
                showInputRef.current = showInput;
        });
    }, []);

    const onClick = () => {
        return store.setKey("showInput", !showInputRef.current);
    };

    return (
        <TitleContainerDiv onClick={onClick} onTouchStart={onClick}>
            <ChordSymbol value={name} fontSize={28} />
        </TitleContainerDiv>
    );
};
