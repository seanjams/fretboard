import React, { useEffect } from "react";
import {
    AppStore,
    AudioStore,
    getComputedAppState,
    ProgressionStateType,
    useStateRef,
    useTouchHandlers,
} from "../../store";
import { FretboardNameType, LabelTypes, ReactMouseEvent } from "../../types";
import {
    FLAT_NAMES,
    lighterGrey,
    SAFETY_AREA_MARGIN,
    SHARP_NAMES,
    SP,
} from "../../utils";
import { ChordSymbol } from "../ChordSymbol";
import { Div, FlexRow } from "../Common";

// Component
interface ProgressionOptionProps {
    selected: boolean;
    progressionIndex: number;
    progression: ProgressionStateType;
    onClick: (event: ReactMouseEvent) => void;
}

export const ProgressionOption: React.FC<ProgressionOptionProps> = ({
    selected,
    progressionIndex,
    progression,
    onClick,
}) => {
    const progressionNames = progression.fretboards
        .map(
            (fretboard) =>
                fretboard.names.find((name) => name.isSelected) ||
                fretboard.names[0]
        )
        .filter((name) => name.chordName);

    function getNoteName(rootIdx: number) {
        return progression.label === "sharp"
            ? SHARP_NAMES[rootIdx]
            : FLAT_NAMES[rootIdx];
    }

    const touchHandlers = useTouchHandlers({ onStart: onClick });

    return (
        <FlexRow
            {...touchHandlers}
            borderRadius={`${SP[2]}px`}
            boxShadow="0 0 4px 0 #aaa"
            marginTop={`${SP[2]}px`}
            marginBottom={`${SP[2]}px`}
            height={`calc(100% - ${2 * SP[2]}px)`}
            backgroundColor={selected ? lighterGrey : "transparent"}
        >
            {progressionNames.map((name, i) => {
                return (
                    <Div
                        paddingLeft={`${SP[1]}px`}
                        paddingRight={`${SP[1]}px`}
                        key={`change-progression-name-${progressionIndex}-${i}`}
                    >
                        <ChordSymbol
                            rootName={getNoteName(name.rootIdx)}
                            chordName={name.chordName}
                            fontSize={12}
                        />
                    </Div>
                );
            })}
        </FlexRow>
    );
};

interface ProgressionSelectorProps {
    appStore: AppStore;
    audioStore: AudioStore;
}

export const ProgressionSelector: React.FC<ProgressionSelectorProps> = ({
    audioStore,
    appStore,
}) => {
    const appState = appStore.getComputedState();
    const { progressions } = appState;

    const [getState, setState] = useStateRef(() => ({
        currentProgressionIndex: appState.currentProgressionIndex,
    }));

    const { currentProgressionIndex } = getState();

    useEffect(() => {
        return appStore.addListener((newState) => {
            const { currentProgressionIndex } = getComputedAppState(newState);
            if (
                getState().currentProgressionIndex !== currentProgressionIndex
            ) {
                setState({
                    currentProgressionIndex,
                });
            }
        });
    }, []);

    const getClickHandler = (i: number) => (event: ReactMouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        appStore.dispatch.setCurrentProgressionIndex(i);
    };

    return (
        <FlexRow
            justifyContent="space-evenly"
            width={`calc(100% - ${2 * SAFETY_AREA_MARGIN}px)`}
            padding={`0 ${2 * SAFETY_AREA_MARGIN}px`}
            height="100%"
        >
            {progressions.map((progression, i) => {
                const onClick = getClickHandler(i);
                return (
                    <ProgressionOption
                        key={`change-progression-option-${i}`}
                        onClick={onClick}
                        progressionIndex={i}
                        progression={progression}
                        selected={i === currentProgressionIndex}
                    />
                );
            })}
        </FlexRow>
    );
};
