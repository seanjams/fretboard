import React, { useEffect } from "react";
import {
    AppStore,
    AudioStore,
    getComputedAppState,
    useStateRef,
    useTouchHandlers,
} from "../../store";
import { FretboardNameType, LabelTypes, ReactMouseEvent } from "../../types";
import { FLAT_NAMES, SAFETY_AREA_MARGIN, SHARP_NAMES } from "../../utils";
import { ChordSymbol } from "../ChordSymbol";
import { Div, FlexRow } from "../Common";

// Component
interface ChordNameOptionProps {
    label: LabelTypes;
    name: FretboardNameType;
    onClick: (event: ReactMouseEvent) => void;
}

export const ChordNameOption: React.FC<ChordNameOptionProps> = ({
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

    const getClickHandler =
        (name: FretboardNameType) => (event: ReactMouseEvent) => {
            event.preventDefault();
            event.stopPropagation();
            const { display } = appStore.state;
            appStore.dispatch.setFretboardName(name.rootIdx);
            if (display !== "normal") appStore.dispatch.setDisplay("normal");
        };

    return (
        <FlexRow
            justifyContent="space-evenly"
            width={`calc(100% - ${2 * SAFETY_AREA_MARGIN}px)`}
            padding={`0 ${2 * SAFETY_AREA_MARGIN}px`}
            height="100%"
        >
            {names.map((name, i) => {
                const onClick = getClickHandler(name);
                return (
                    <ChordNameOption
                        key={`change-name-option-${i}`}
                        onClick={onClick}
                        name={name}
                        label={label}
                    />
                );
            })}
        </FlexRow>
    );
};
