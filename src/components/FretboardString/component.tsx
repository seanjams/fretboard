import * as React from "react";
import { AppStore, AudioStore, TouchStore } from "../../store";
import { STRING_SIZE } from "../../utils";
import { Fret } from "../Fret";
import { StringDiv } from "./style";

// Component
interface Props {
    base: number;
    stringIndex: number;
    appStore: AppStore;
    audioStore: AudioStore;
    touchStore: TouchStore;
}

export const FretboardString: React.FC<Props> = ({
    base,
    stringIndex,
    appStore,
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
                    audioStore={audioStore}
                    touchStore={touchStore}
                />
            );
        });

    return <StringDiv>{invert ? frets.reverse() : frets}</StringDiv>;
};
