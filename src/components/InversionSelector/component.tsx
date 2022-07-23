import React from "react";
import {
    AppStore,
    AudioStore,
    getComputedAppState,
    useDerivedState,
    useTouchHandlers,
} from "../../store";
import { FretboardNameType, LabelTypes, ReactMouseEvent } from "../../types";
import { COLORS, FLAT_NAMES, SHARP_NAMES } from "../../utils";
import { TextButton } from "../Buttons";
import { ChordSymbol } from "../ChordSymbol";
import { Div, FlexRow } from "../Common";

// Component
interface InversionOptionProps {
    label: LabelTypes;
    name: FretboardNameType;
    onClick: (event: ReactMouseEvent) => void;
}

export const InversionOption: React.FC<InversionOptionProps> = ({
    label,
    name,
    onClick,
}) => {
    function getNoteName(rootIdx: number, label: LabelTypes) {
        return label === "sharp" ? SHARP_NAMES[rootIdx] : FLAT_NAMES[rootIdx];
    }

    const touchHandlers = useTouchHandlers({ onStart: onClick });

    return (
        <Div {...touchHandlers}>
            <ChordSymbol
                rootName={getNoteName(name.rootIdx, label)}
                chordName={name.chordName}
                fontSize={20}
            />
        </Div>
    );
};

interface InversionSelectorProps {
    appStore: AppStore;
    audioStore: AudioStore;
}

export const InversionSelector: React.FC<InversionSelectorProps> = ({
    appStore,
    audioStore,
}) => {
    const [getState, setState] = useDerivedState(
        appStore,
        deriveStateFromAppState
    );
    const { currentVisibleFretboardIndex, label, names } = getState();

    function deriveStateFromAppState(appState: typeof appStore.state) {
        const { currentVisibleFretboardIndex, progression, fretboard } =
            getComputedAppState(appState);
        const { label } = progression;
        const { names } = fretboard;
        return {
            currentVisibleFretboardIndex,
            label,
            names,
        };
    }

    const getClickHandler =
        (name: FretboardNameType) => (event: ReactMouseEvent) => {
            event.preventDefault();
            event.stopPropagation();
            const { display } = appStore.state;
            appStore.dispatch.setFretboardName(name.rootIdx, name.chordName);
            if (display !== "normal") appStore.dispatch.setDisplay("normal");
        };

    return (
        <FlexRow width="100%" height="100%">
            <FlexRow justifyContent="space-evenly" width="75%" height="100%">
                {names.map((name, i) => {
                    const onClick = getClickHandler(name);
                    return (
                        <InversionOption
                            key={`change-inversion-option-${i}`}
                            onClick={onClick}
                            name={name}
                            label={label}
                        />
                    );
                })}
            </FlexRow>
            <FlexRow justifyContent="space-evenly" width="25%" height="44px">
                <TextButton
                    backgroundColor={COLORS[currentVisibleFretboardIndex][1]}
                    activeColor={COLORS[currentVisibleFretboardIndex][1]}
                    onClick={() => appStore.dispatch.copyFretboard(-1)}
                >
                    Copy Left
                </TextButton>
                <TextButton
                    backgroundColor={COLORS[currentVisibleFretboardIndex][1]}
                    activeColor={COLORS[currentVisibleFretboardIndex][1]}
                    onClick={() =>
                        appStore.dispatch.cascadeHighlightedPosition()
                    }
                >
                    Cascade Highlight
                </TextButton>
                <TextButton
                    backgroundColor={COLORS[currentVisibleFretboardIndex][1]}
                    activeColor={COLORS[currentVisibleFretboardIndex][1]}
                    onClick={() => appStore.dispatch.copyFretboard(1)}
                >
                    Copy Right
                </TextButton>
            </FlexRow>
        </FlexRow>
    );
};
