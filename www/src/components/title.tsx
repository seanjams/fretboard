import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import { StateType } from "../types";
import {
    currentProgression,
    currentFretboard,
    getName,
    getNotes,
} from "../utils";
import { Store, useStateRef } from "../store";
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
    const [getState, setState] = useStateRef({
        name: getName(
            getNotes(currentFretboard(store.state)),
            currentProgression(store.state).label
        ),
    });
    const { name } = getState();
    const { rootIdx, rootName, chordName } = name;

    useEffect(() => {
        return store.addListener((newState) => {
            const state = getState();
            const name = getName(
                getNotes(currentFretboard(newState)),
                currentProgression(newState).label
            );
            if (state.name !== name)
                setState({
                    ...state,
                    name,
                });
        });
    }, []);

    // fix these parameters, used to make font size dynamic for longer names

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
        chordName.length < x0
            ? y0
            : chordName.length > x1
            ? y1
            : ((y0 - y1 + buffer) / (x0 - x1)) * (chordName.length - x1) + y1;

    const onClick = () => {
        return store.reducers.setShowInput(!store.state.showInput);
    };

    return (
        <TitleContainerDiv onClick={onClick} onTouchStart={onClick}>
            <ChordSymbol
                rootName={rootName}
                chordName={chordName}
                fontSize={fontSize}
            />
        </TitleContainerDiv>
    );
};
