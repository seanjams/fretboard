import * as React from "react";
import { AppStore, AudioStore, TouchStore } from "../../store";
import { STRING_SIZE } from "../../utils";
import { Fret } from "../Fret";
import { StringDiv } from "./style";

// Component
interface FretboardStringProps {
    base: number;
    stringIndex: number;
    appStore: AppStore;
    audioStore: AudioStore;
    touchStore: TouchStore;
}

export const FretboardString: React.FC<FretboardStringProps> = ({
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
            return (
                <Fret
                    key={`string-${stringIndex}-fret-${i}`}
                    appStore={appStore}
                    audioStore={audioStore}
                    touchStore={touchStore}
                    fretIndex={i}
                    stringIndex={stringIndex}
                    openString={i === 0}
                />
            );
        });

    return <StringDiv>{invert ? frets.reverse() : frets}</StringDiv>;
};
