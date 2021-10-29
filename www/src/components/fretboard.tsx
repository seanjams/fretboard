import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Store } from "../store";
import { StateType, ArrowTypes, SliderStateType } from "../types";
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
    getCurrentProgression,
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
    store: Store<StateType>;
    sliderStore: Store<SliderStateType>;
}

export const Fretboard: React.FC<Props> = ({
    fretboardHeight,
    store,
    sliderStore,
}) => {
    const { invert, leftHand } = store.state;
    const { label } = getCurrentProgression(store.state);
    // whether the high E string appears on the top or bottom of the fretboard,
    // depending on invert/leftHand views
    const [highEBottom, setHighEBottom] = useState(invert !== leftHand);

    useEffect(() => {
        window.addEventListener("keydown", onKeyPress);
        return () => {
            window.removeEventListener("keydown", onKeyPress);
        };
    }, []);

    const strings = STANDARD_TUNING.map((value, i) => {
        return (
            <GuitarString
                stringIndex={i}
                base={value}
                key={`string-${i}`}
                fretboardHeight={fretboardHeight}
                store={store}
                sliderStore={sliderStore}
            />
        );
    });

    function onKeyPress(this: Window, e: KeyboardEvent): any {
        const { invert, leftHand } = store.state;
        const direction = e.key;
        // Get the action direction based on orientation of fretboard
        // could maybe move this to reducer.
        // highEBottom
        // 	- whether the high E string appears on the top or bottom of the fretboard,
        // 	- depending on invert/leftHand views
        const highEBottom = invert !== leftHand;
        const keyMap: { [key in string]: () => StateType } = {
            ArrowUp: highEBottom
                ? store.reducers.decrementPositionY
                : store.reducers.incrementPositionY,
            ArrowDown: highEBottom
                ? store.reducers.incrementPositionY
                : store.reducers.decrementPositionY,
            ArrowRight: invert
                ? store.reducers.decrementPositionX
                : store.reducers.incrementPositionX,
            ArrowLeft: invert
                ? store.reducers.incrementPositionX
                : store.reducers.decrementPositionX,
        };

        if (keyMap[direction]) {
            e.preventDefault();
            keyMap[direction]();
        } else {
            let naturals: { [key in string]: number } = {};
            let i = 0;
            for (let name of NATURAL_NOTE_NAMES) {
                if (label === "flat") {
                    naturals[name] = i;
                    if (name !== F && name !== C) i++;
                    naturals[name.toLowerCase()] = i;
                    i++;
                } else if (label === "sharp") {
                    naturals[name.toLowerCase()] = i;
                    if (name !== E && name !== B) i++;
                    naturals[name] = i;
                    i++;
                }
            }

            if (naturals.hasOwnProperty(e.key)) {
                e.preventDefault();
                store.reducers.setNote(naturals[e.key]);
            }
        }
    }

    return (
        <FretboardContainer width={FRETBOARD_WIDTH}>
            <FretboardDiv>
                {highEBottom ? strings : strings.reverse()}
            </FretboardDiv>
        </FretboardContainer>
    );
};
