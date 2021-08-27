import React, { useRef } from "react";
import styled from "styled-components";
import { StateType, Store, ActionTypes, usePartialStore } from "../store";
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
    const [getState] = usePartialStore(store, [
        "label",
        "fretboards",
        "focusedIndex",
        "showInput",
    ]);
    const { label, fretboards, focusedIndex } = getState();

    const fretboard = fretboards[focusedIndex];

    const onClick = () => {
        return store.dispatch({
            type: "SET_SHOW_INPUT",
            payload: { showInput: !getState().showInput },
        });
    };

    return (
        <TitleContainerDiv onClick={onClick} onTouchStart={onClick}>
            <ChordSymbol value={fretboard.getName(label)} fontSize={28} />
        </TitleContainerDiv>
    );
};
