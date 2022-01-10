import * as React from "react";
import { AppStore, AudioStore, SliderStore, TouchStore } from "../../store";
import { STRING_SIZE } from "../../utils";
import { Fret } from "../Fret";
import { StringDiv } from "./style";

// Component
interface Props {
    base: number;
    stringIndex: number;
    appStore: AppStore;
    sliderStore: SliderStore;
    audioStore: AudioStore;
    touchStore: TouchStore;
}

export const FretboardString: React.FC<Props> = ({
    base,
    stringIndex,
    appStore,
    sliderStore,
    audioStore,
    touchStore,
}) => {
    const { invert } = appStore.state;

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
                    appStore={appStore}
                    sliderStore={sliderStore}
                    audioStore={audioStore}
                    touchStore={touchStore}
                />
            );
        });

    return <StringDiv>{invert ? frets.reverse() : frets}</StringDiv>;
};
