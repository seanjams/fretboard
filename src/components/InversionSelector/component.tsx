import React, { useEffect } from "react";
import {
    AppStore,
    AudioStore,
    getComputedAppState,
    useStateRef,
    useTouchHandlers,
} from "../../store";
import { FretboardNameType, LabelTypes, ReactMouseEvent } from "../../types";
import { FLAT_NAMES, SHARP_NAMES, shouldUpdate } from "../../utils";
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
    const derivedState = deriveStateFromAppState(appStore.state);
    const [getState, setState] = useStateRef(() => derivedState);
    const { label, names } = getState();

    function deriveStateFromAppState(appState: typeof appStore.state) {
        const { currentFretboardIndex, progression, fretboard } =
            getComputedAppState(appState);
        const { label } = progression;
        const { names } = fretboard;
        return {
            currentFretboardIndex,
            label,
            names,
        };
    }

    useEffect(() => {
        return appStore.addListener((appState) => {
            const derivedState = deriveStateFromAppState(appState);
            if (shouldUpdate(getState(), derivedState)) {
                setState(derivedState);
            }
        });
    }, []);

    const getClickHandler =
        (name: FretboardNameType) => (event: ReactMouseEvent) => {
            event.preventDefault();
            event.stopPropagation();
            const { display } = appStore.state;
            appStore.dispatch.setFretboardName(name.rootIdx, name.chordName);
            if (display !== "normal") appStore.dispatch.setDisplay("normal");
        };

    return (
        <FlexRow justifyContent="space-evenly" width="100%" height="100%">
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
    );
};
