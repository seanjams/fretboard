import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import {
    STANDARD_TUNING,
    NATURAL_NOTE_NAMES,
    FRETBOARD_WIDTH,
    E,
    B,
    C,
    F,
} from "../consts";
import { Store, StateType, useStore, ActionTypes } from "../store";
import { String } from "./string";
import { Legend } from "./legend";
import { getPositionActionType } from "../utils";

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
    store: Store<StateType, ActionTypes>;
}

export const Fretboard: React.FC<Props> = ({ store }) => {
    const [state, setState] = useStore(store);
    const stateRef = useRef(state);
    // whether the high E string appears on the top or bottom of the fretboard,
    // depending on invert/leftHand views
    const highEBottom = state.invert !== state.leftHand;

    let naturals: { [key in string]: number } = {};
    let i = 0;
    for (let name of NATURAL_NOTE_NAMES) {
        if (state.label === "flat") {
            naturals[name] = i;
            if (name !== F && name !== C) i++;
            naturals[name.toLowerCase()] = i;
            i++;
        } else if (state.label === "sharp") {
            naturals[name.toLowerCase()] = i;
            if (name !== E && name !== B) i++;
            naturals[name] = i;
            i++;
        }
    }

    useEffect(() => {
        window.addEventListener("keydown", onKeyPress);
        return () => {
            window.removeEventListener("keydown", onKeyPress);
        };
    });

    const strings = STANDARD_TUNING.map((value, i) => {
        return (
            <String
                stringIndex={i}
                base={value}
                key={`string-${i}`}
                store={store}
            />
        );
    });

    function onKeyPress(this: Window, e: KeyboardEvent): any {
        const actionType = getPositionActionType(
            stateRef.current.invert,
            stateRef.current.leftHand,
            e.key
        );
        if (actionType) {
            e.preventDefault();
            store.dispatch({
                type: actionType,
            });
        } else if (naturals.hasOwnProperty(e.key)) {
            e.preventDefault();
            store.dispatch({
                type: "SET_NOTE",
                payload: {
                    note: naturals[e.key],
                },
            });
        }
    }

    return (
        <FretboardContainer width={FRETBOARD_WIDTH}>
            <FretboardDiv>
                <Legend top={true} store={store} />
                {highEBottom ? strings : strings.reverse()}
                <Legend store={store} />
            </FretboardDiv>
        </FretboardContainer>
    );
};
