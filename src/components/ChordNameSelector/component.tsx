import React, { useEffect } from "react";
import {
    AppStore,
    AudioStore,
    getComputedAppState,
    useStateRef,
} from "../../store";
import { FretboardNameType, LabelTypes } from "../../types";
import { FLAT_NAMES, SHARP_NAMES } from "../../utils";
import { ChordSymbol } from "../ChordSymbol";
import { Div, FlexRow } from "../Common";

// Component
interface ChordNameSelectorProps {
    appStore: AppStore;
    audioStore: AudioStore;
}

export const ChordNameSelector: React.FC<ChordNameSelectorProps> = ({
    audioStore,
    appStore,
}) => {
    const { fretboard, progression, currentFretboardIndex } =
        appStore.getComputedState();
    const { label } = progression;

    const [getState, setState] = useStateRef(() => ({
        currentFretboardIndex,
        label,
        names: fretboard.names,
    }));
    const { names } = getState();

    useEffect(() => {
        return appStore.addListener((newState) => {
            const { currentFretboardIndex, progression, fretboard } =
                getComputedAppState(newState);
            const { label } = progression;
            const { names } = fretboard;
            if (
                getState().currentFretboardIndex !== currentFretboardIndex ||
                getState().label !== label ||
                getState().names !== names
            ) {
                setState({
                    currentFretboardIndex,
                    label,
                    names,
                });
            }
        });
    }, []);

    function getNoteName(label: LabelTypes, rootIdx: number) {
        return label === "sharp" ? SHARP_NAMES[rootIdx] : FLAT_NAMES[rootIdx];
    }

    function onSelectName(name: FretboardNameType) {
        appStore.dispatch.setFretboardName(name.rootIdx);
    }

    return (
        <FlexRow justifyContent="space-evenly" width="100%">
            {names.map((name, i) => (
                <Div
                    onClick={() => onSelectName(name)}
                    onTouchStart={() => onSelectName(name)}
                    key={`change-name-selector-${i}`}
                >
                    <ChordSymbol
                        rootName={getNoteName(label, name.rootIdx)}
                        chordName={name.chordName}
                        fontSize={20}
                    />
                </Div>
            ))}
        </FlexRow>
    );
};
