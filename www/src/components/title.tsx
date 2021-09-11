import React from "react";
import styled from "styled-components";
import {
    StateType,
    Store,
    ActionTypes,
    useStore,
    useCurrentProgression,
    useCurrentFretboard,
} from "../store";
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
    store: Store<StateType, ActionTypes>;
}

export const Title: React.FC<Props> = ({ store }) => {
    const [getState] = useStore(store, [
        "showInput",
        "currentProgressionIndex",
    ]);
    const [getCurrentProgression] = useCurrentProgression(store, [
        "focusedIndex",
        "label",
    ]);
    const [getCurrentFretboard] = useCurrentFretboard(store, [
        "rootIdx",
        "rootName",
        "chordName",
        "chordNotes",
    ]);
    const { rootName, chordName, chordNotes } = getCurrentFretboard();
    const name = chordName || chordNotes;

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
        return store.dispatch({
            type: "SET_SHOW_INPUT",
            payload: { showInput: !getState().showInput },
        });
    };

    return (
        <TitleContainerDiv onClick={onClick} onTouchStart={onClick}>
            <ChordSymbol
                rootName={rootName}
                chordName={name}
                fontSize={fontSize}
            />
        </TitleContainerDiv>
    );
};
