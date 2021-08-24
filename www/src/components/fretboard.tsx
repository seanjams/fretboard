import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import {
    Store,
    StateType,
    ActionTypes,
    useActiveStoreRef,
    usePassiveStoreRef,
} from "../store";
import { String } from "./string";
// import { Legend } from "./legend";
import {
    getPositionActionType,
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
    store: Store<StateType, ActionTypes>;
}

export const Fretboard: React.FC<Props> = ({ fretboardHeight, store }) => {
    const [getInvert, setInvert] = useActiveStoreRef(store, "invert");
    const [getLeftHand, setLeftHand] = useActiveStoreRef(store, "leftHand");
    const [getLabel] = usePassiveStoreRef(store, "label");
    // whether the high E string appears on the top or bottom of the fretboard,
    // depending on invert/leftHand views
    const [highEBottom, setHighEBottom] = useState(
        getInvert() !== getLeftHand()
    );

    useEffect(() => {
        window.addEventListener("keydown", onKeyPress);
        return () => {
            window.removeEventListener("keydown", onKeyPress);
        };
    }, []);

    const strings = STANDARD_TUNING.map((value, i) => {
        return (
            <String
                stringIndex={i}
                base={value}
                key={`string-${i}`}
                fretboardHeight={fretboardHeight}
                store={store}
            />
        );
    });

    function onKeyPress(this: Window, e: KeyboardEvent): any {
        const actionType = getPositionActionType(
            getInvert(),
            getLeftHand(),
            e.key
        );
        if (actionType) {
            e.preventDefault();
            store.dispatch({
                type: actionType,
            });
        } else {
            let naturals: { [key in string]: number } = {};
            let i = 0;
            for (let name of NATURAL_NOTE_NAMES) {
                if (getLabel() === "flat") {
                    naturals[name] = i;
                    if (name !== F && name !== C) i++;
                    naturals[name.toLowerCase()] = i;
                    i++;
                } else if (getLabel() === "sharp") {
                    naturals[name.toLowerCase()] = i;
                    if (name !== E && name !== B) i++;
                    naturals[name] = i;
                    i++;
                }
            }

            if (naturals.hasOwnProperty(e.key)) {
                e.preventDefault();
                store.dispatch({
                    type: "SET_NOTE",
                    payload: {
                        note: naturals[e.key],
                    },
                });
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
