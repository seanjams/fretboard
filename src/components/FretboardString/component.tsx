import * as React from "react";
import { AppStore, AudioStore } from "../../store";
import { STRING_SIZE } from "../../utils";
import { Fret } from "../Fret";
import { StringDiv } from "./style";

// Component
interface FretboardStringProps {
    base: number;
    stringIndex: number;
    appStore: AppStore;
    audioStore: AudioStore;
}

export const FretboardString: React.FC<FretboardStringProps> = ({
    base,
    stringIndex,
    appStore,
    audioStore,
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
                    fretIndex={i}
                    stringIndex={stringIndex}
                />
            );
        });

    return <StringDiv>{invert ? frets.reverse() : frets}</StringDiv>;
};
