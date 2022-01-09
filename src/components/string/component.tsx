import * as React from "react";
import { AppStore, AudioStore, SliderStore, TouchStore } from "../../store";
import { STRING_SIZE } from "../../utils";
import { Fret } from "../fret";
import { StringDiv } from "./style";

// Component
interface Props {
    base: number;
    stringIndex: number;
    store: AppStore;
    sliderStore: SliderStore;
    audioStore: AudioStore;
    touchStore: TouchStore;
}

export const GuitarString: React.FC<Props> = ({
    base,
    stringIndex,
    store,
    sliderStore,
    audioStore,
    touchStore,
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
                    store={store}
                    sliderStore={sliderStore}
                    audioStore={audioStore}
                    touchStore={touchStore}
                />
            );
        });

    return <StringDiv>{invert ? frets.reverse() : frets}</StringDiv>;
};
