import React, { useRef } from "react";
import styled from "styled-components";
import { StateType, Store, ActionTypes, useActiveStoreRef } from "../store";
import { ChordSymbol } from "./symbol";

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
    const [getLabel, setLabel] = useActiveStoreRef(store, "label");
    const [getShowInput, setShowInput] = useActiveStoreRef(store, "showInput");
    const [getFretboards, setFretboards] = useActiveStoreRef(
        store,
        "fretboards"
    );
    const [getFocusedIndex, setFocusedIndex] = useActiveStoreRef(
        store,
        "focusedIndex"
    );

    const fretboard = getFretboards()[getFocusedIndex()];
    const notesRef = useRef(fretboard.notes);
    notesRef.current = fretboard.notes;

    const onClick = () => {
        return store.dispatch({
            type: "SET_SHOW_INPUT",
            payload: { showInput: !getShowInput() },
        });
    };

    return (
        <TitleContainerDiv onClick={onClick} onTouchStart={onClick}>
            <ChordSymbol value={fretboard.getName(getLabel())} fontSize={28} />
        </TitleContainerDiv>
    );
};
