import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import {
    Store,
    useStateRef,
    StateType,
    SliderStateType,
    AnyReducersType,
    current,
} from "../store";
import { ArrowTypes } from "../types";
import { GuitarString } from "./string";
// import { Legend } from "./legend";
import {
    STANDARD_TUNING,
    NATURAL_NOTE_NAMES,
    FRETBOARD_WIDTH,
    E,
    B,
    C,
    F,
} from "../utils";

// CSS
interface CSSProps {
    width?: number;
    color?: string;
}

const FretboardContainer = styled.div.attrs((props: CSSProps) => ({
    style: {
        width: `${props.width}px`,
    },
}))<CSSProps>`
    display: flex;
    align-items: stretch;
`;

const FretboardDiv = styled.div<CSSProps>`
    display: flex;
    flex-direction: column;
    width: 100%;
`;

// Component
interface Props {
    fretboardHeight: number;
    store: Store<StateType, AnyReducersType<StateType>>;
    sliderStore: Store<SliderStateType, AnyReducersType<SliderStateType>>;
}

export const Fretboard: React.FC<Props> = ({
    fretboardHeight,
    store,
    sliderStore,
}) => {
    // whether the high E string appears on the top or bottom of the fretboard,
    // depending on invert/leftHand views
    const [getState, setState] = useStateRef({
        highEBottom: store.state.invert !== store.state.leftHand,
    });
    const { highEBottom } = getState();

    useEffect(() => {
        return store.addListener(({ invert, leftHand }) => {
            const highEBottom = invert !== leftHand;
            if (getState().highEBottom !== highEBottom)
                setState((prevState) => ({
                    ...prevState,
                    highEBottom,
                }));
        });
    }, []);

    const strings = STANDARD_TUNING.map((value, i) => (
        <GuitarString
            stringIndex={i}
            base={value}
            key={`string-${i}`}
            fretboardHeight={fretboardHeight}
            store={store}
            sliderStore={sliderStore}
        />
    ));

    return (
        <FretboardContainer width={FRETBOARD_WIDTH}>
            <FretboardDiv>
                {highEBottom ? strings : strings.reverse()}
            </FretboardDiv>
        </FretboardContainer>
    );
};
