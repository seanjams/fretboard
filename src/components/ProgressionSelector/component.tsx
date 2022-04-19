import React, { useEffect } from "react";
import moment from "moment";
import {
    AppStore,
    AudioStore,
    getComputedAppState,
    useStateRef,
} from "../../store";
import { WindowMouseEvent } from "../../types";
import { FLAT_NAMES, list, mediumGrey, SHARP_NAMES, SP } from "../../utils";
import { ChordSymbol } from "../ChordSymbol";
import { ProgressionControls } from "../Controls";
import { Div, FlexRow } from "../Common";
import {
    EmptyOption,
    LastUpdatedTime,
    ProgressionSelectorContainer,
} from "./style";
import { ScrollSelect, ScrollSelectOption } from "../ScrollSelect";

interface ProgressionSelectorProps {
    appStore: AppStore;
    audioStore: AudioStore;
}

export const ProgressionSelector: React.FC<ProgressionSelectorProps> = ({
    audioStore,
    appStore,
}) => {
    const appState = appStore.getComputedState();

    const [getState, setState] = useStateRef(() => ({
        currentProgressionIndex: appState.currentProgressionIndex,
        progressions: appState.progressions,
    }));

    const { currentProgressionIndex, progressions } = getState();

    useEffect(() => {
        return appStore.addListener((newState) => {
            const { currentProgressionIndex, progressions } =
                getComputedAppState(newState);

            if (
                getState().currentProgressionIndex !==
                    currentProgressionIndex ||
                getState().progressions.length !== progressions.length
            ) {
                setState({
                    currentProgressionIndex,
                    progressions,
                });
            }
        });
    }, []);

    const getClickHandler = (event: WindowMouseEvent, i: number) => {
        event.preventDefault();
        event.stopPropagation();
        appStore.dispatch.setCurrentProgressionIndex(i);
    };

    const onAddProgression = () => {
        appStore.dispatch.addProgression();
    };

    const onRemoveProgression = () => {
        if (getState().progressions.length <= 1) return;
        appStore.dispatch.removeProgression();
    };

    const options = progressions.map((progression, i) => {
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

        return (
            <ScrollSelectOption
                key={`progression-option-${i}`}
                value={`progression-option-${i}`}
            >
                {progressionNames.length ? (
                    <FlexRow width="100%" height="100%">
                        {progressionNames.map((name, j) => {
                            return (
                                <Div
                                    paddingLeft={`${SP[1]}px`}
                                    paddingRight={`${SP[1]}px`}
                                    key={`change-progression-name-${i}-${j}`}
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
                ) : (
                    <FlexRow width="100%" height="100%">
                        <EmptyOption key={`change-progression-name-${i}-0`}>
                            Empty
                        </EmptyOption>
                    </FlexRow>
                )}
                <LastUpdatedTime>
                    {progression.lastUpdated
                        ? moment(progression.lastUpdated).format(
                              "M/D/YY, h:mm:ss a"
                          )
                        : "Just Now"}
                </LastUpdatedTime>
            </ScrollSelectOption>
        );
    });

    return (
        <ProgressionSelectorContainer>
            <Div width="100%" height="10%" fontSize="10px" color={mediumGrey}>
                Load/Save Progression
            </Div>
            <FlexRow width="100%" height="90%">
                <FlexRow
                    height="100%"
                    flexShrink="1"
                    paddingRight={`${SP[2]}px`}
                >
                    <ProgressionControls
                        appStore={appStore}
                        onAddClick={onAddProgression}
                        onRemoveClick={onRemoveProgression}
                    />
                </FlexRow>
                <FlexRow height="100%" flexGrow="1">
                    <ScrollSelect
                        onChange={getClickHandler}
                        value={`progression-option-${currentProgressionIndex}`}
                    >
                        {options}
                    </ScrollSelect>
                </FlexRow>
            </FlexRow>
        </ProgressionSelectorContainer>
    );
};
