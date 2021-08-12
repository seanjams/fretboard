import React, { useRef, useState, useEffect } from "react";
import styled from "styled-components";
import { StateType, Store, ActionTypes, useStore } from "../store";
import { isEqual } from "lodash";

// CSS
interface CSSProps {}

const TitleContainerDiv = styled.div<CSSProps>`
    padding: 10px 0px 0px 30px;
    font-size: 28px;
    font-family: Arial;
    height: 28px;
`;

// Component
interface Props {
    store: Store<StateType, ActionTypes>;
}

export const Title: React.FC<Props> = ({ store }) => {
    const [state, setState] = useStore(store);
    const { fretboards, focusedIndex, label } = state;
    const fretboard = fretboards[focusedIndex];
    const [name, setName] = useState(fretboard.getName(label));
    const notesRef = useRef(fretboard.notes);
    const labelRef = useRef(label);

    useEffect(() => {
        store.addListener(({ focusedIndex, fretboards, label }) => {
            if (
                !isEqual(fretboards[focusedIndex].notes, notesRef.current) ||
                label !== labelRef.current
            ) {
                setName(fretboards[focusedIndex].getName(label));
                notesRef.current = fretboards[focusedIndex].notes;
                labelRef.current = label;
            }
        });
    }, []);

    return (
        <TitleContainerDiv
            onClick={() => store.setKey("showInput", true)}
            onTouchStart={() => store.setKey("showInput", true)}
        >
            {name}
        </TitleContainerDiv>
    );
};
