import * as React from "react";
import styled from "styled-components";
import { Store, StateType, SliderStateType, AnyReducersType } from "../store";
import { Fret } from "./fret";
import { STRING_SIZE } from "../utils";

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
    store: Store<StateType, AnyReducersType<StateType>>;
    sliderStore: Store<SliderStateType, AnyReducersType<SliderStateType>>;
}

export const GuitarString: React.FC<Props> = ({
    base,
    stringIndex,
    fretboardHeight,
    store,
    sliderStore,
}) => {
    const { invert } = store.state;

    const frets = Array(STRING_SIZE)
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
                    sliderStore={sliderStore}
                />
            );
        });

    return <StringDiv>{invert ? frets.reverse() : frets}</StringDiv>;
};
