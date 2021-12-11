import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import { getName, getNotes } from "../utils";
import {
    Store,
    useStateRef,
    StateType,
    AnyReducersType,
    current,
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
    store: Store<StateType, AnyReducersType<StateType>>;
}

export const Title: React.FC<Props> = ({ store }) => {
    const { fretboard, progression } = current(store.state);
    const [getState, setState] = useStateRef({
        name: getName(getNotes(fretboard), progression.label),
    });
    const { name } = getState();
    const { rootName, chordName } = name;

    useEffect(() => {
        return store.addListener((newState) => {
            const { fretboard, progression } = current(newState);
            const name = getName(getNotes(fretboard), progression.label);
            if (getState().name !== name)
                setState((prevState) => ({
                    ...prevState,
                    name,
                }));
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
        return store.dispatch.setShowInput(!store.state.showInput);
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
