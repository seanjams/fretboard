import React, { useEffect } from "react";
import moment from "moment";
import {
    AppStore,
    AudioStore,
    getComputedAppState,
    ProgressionStateType,
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

const getProgressionString = (
    progression: ProgressionStateType,
    index: number
) => {
    return (
        progression.fretboards.map((fretboard) => list(fretboard)).join("") +
        index
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

    const progressionActive: { [key in string]: boolean } = {};
    for (let progressionIndex in appState.progressions) {
        const progression = appState.progressions[progressionIndex];
        progressionActive[
            getProgressionString(progression, +progressionIndex)
        ] = false;
    }

    const [getState, setState] = useStateRef(() => ({
        currentProgressionIndex: appState.currentProgressionIndex,
        progressions: appState.progressions,
        progressionActive,
        isDeleting: false,
        isUpdating: false,
    }));

    const { currentProgressionIndex, progressions } = getState();

    useEffect(() => {
        return appStore.addListener((newState) => {
            const { currentProgressionIndex, progressions } =
                getComputedAppState(newState);

            const progressionActive: { [key in string]: boolean } = {};
            for (let progressionIndex in progressions) {
                const progression = progressions[progressionIndex];
                progressionActive[
                    getProgressionString(progression, +progressionIndex)
                ] = false;
            }

            if (
                getState().currentProgressionIndex !==
                    currentProgressionIndex ||
                getState().progressions.length !== progressions.length
            ) {
                setState({
                    currentProgressionIndex,
                    progressions,
                    progressionActive,
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
        setState({ isDeleting: false, isUpdating: true });
    };

    const onRemoveProgression = () => {
        const { progressions, currentProgressionIndex, progressionActive } =
            getState();
        if (getState().progressions.length <= 1) return;
        progressionActive[
            getProgressionString(
                progressions[currentProgressionIndex],
                currentProgressionIndex
            )
        ] = true;
        setState({ progressionActive, isDeleting: true, isUpdating: true });
    };

    // const onComplete = () => {
    //     if (!getState().isUpdating) return;
    //     setState({ isUpdating: false });
    //     if (getState().isDeleting) {
    //         // setState({
    //         //     progressionActive: Array(
    //         //         getState().progressions.length - 1
    //         //     ).fill(false),
    //         // });
    //         appStore.dispatch.removeProgression();
    //     } else {
    //         // appStore.dispatch.addProgression();
    //     }
    // };

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
                <FlexRow width="20%" height="100%" flexGrow="1">
                    <ProgressionControls
                        appStore={appStore}
                        onAddClick={onAddProgression}
                        onRemoveClick={onRemoveProgression}
                    />
                </FlexRow>
                <Div width="80%" height="100%">
                    <ScrollSelect
                        onChange={getClickHandler}
                        value={`progression-option-${currentProgressionIndex}`}
                    >
                        {options}
                    </ScrollSelect>
                </Div>
            </FlexRow>
        </ProgressionSelectorContainer>
    );
};
