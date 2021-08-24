import * as React from "react";
import styled from "styled-components";
import { Store, StateType, ActionTypes, useActiveStoreRef } from "../store";
import { Fret } from "./fret";

// CSS
interface CSSProps {}

const StringDiv = styled.div<CSSProps>`
    display: flex;
    width: 100%;
`;

// Component
interface Props {
    base: number;
    stringIndex: number;
    fretboardHeight: number;
    store: Store<StateType, ActionTypes>;
}

export const String: React.FC<Props> = ({
    base,
    stringIndex,
    fretboardHeight,
    store,
}) => {
    const [getStringSize, setStringSize] = useActiveStoreRef(
        store,
        "stringSize"
    );
    const [getInvert, setInvert] = useActiveStoreRef(store, "invert");

    const frets = Array(getStringSize())
        .fill(0)
        .map((_, i) => {
            const value = base + i;
            return (
                <Fret
                    value={value}
                    openString={i === 0}
                    key={`fret-${value}`}
                    stringIndex={stringIndex}
                    fretboardHeight={fretboardHeight}
                    store={store}
                />
            );
        });

    return <StringDiv>{getInvert() ? frets.reverse() : frets}</StringDiv>;
};
