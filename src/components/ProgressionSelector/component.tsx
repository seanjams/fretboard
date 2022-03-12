import React, { useEffect } from "react";
import moment from "moment";
import { CSSTransition } from "react-transition-group";
import {
    AppStore,
    AudioStore,
    getComputedAppState,
    ProgressionStateType,
    useStateRef,
    useTouchHandlers,
} from "../../store";
import { FretboardNameType, LabelTypes, ReactMouseEvent } from "../../types";
import { FLAT_NAMES, lightGrey, list, SHARP_NAMES, SP } from "../../utils";
import { ChordSymbol } from "../ChordSymbol";
import { ProgressionControls } from "../Controls";
import { Div, FlexRow } from "../Common";
import {
    EmptyOption,
    LastUpdatedTime,
    OptionAnimation,
    OverflowContainerDiv,
    ProgressionOptionContainer,
    ProgressionSelectorContainer,
    SelectorContainer,
    ShadowOverlay,
} from "./style";

const getProgressionString = (
    progression: ProgressionStateType,
    index: number
) => {
    return (
        progression.fretboards.map((fretboard) => list(fretboard)).join("") +
        index
    );
};

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
        <ProgressionOptionContainer {...touchHandlers} selected={selected}>
            {progressionNames.length ? (
                <>
                    <FlexRow width="100%" height="100%">
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
                    {progression.lastUpdated && (
                        <LastUpdatedTime>
                            {moment(progression.lastUpdated).format(
                                "M/D/YY, h:mm:ss a"
                            )}
                        </LastUpdatedTime>
                    )}
                </>
            ) : (
                <FlexRow width="100%" height="100%">
                    <EmptyOption
                        key={`change-progression-name-${progressionIndex}-0`}
                    >
                        Empty
                    </EmptyOption>
                </FlexRow>
            )}
        </ProgressionOptionContainer>
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

    const getClickHandler = (i: number) => (event: ReactMouseEvent) => {
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

    const onComplete = () => {
        if (!getState().isUpdating) return;
        setState({ isUpdating: false });
        if (getState().isDeleting) {
            // setState({
            //     progressionActive: Array(
            //         getState().progressions.length - 1
            //     ).fill(false),
            // });
            appStore.dispatch.removeProgression();
        } else {
            // appStore.dispatch.addProgression();
        }
    };

    return (
        <ProgressionSelectorContainer>
            <Div width="100%" height="10%" fontSize="10px" color={lightGrey}>
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
                <SelectorContainer>
                    <ShadowOverlay className="overflow-container" />
                    <OverflowContainerDiv className="overflow-container">
                        <FlexRow
                            justifyContent="space-evenly"
                            width="fit-content"
                            height="100%"
                        >
                            {progressions.map((progression, i) => {
                                const onClick = getClickHandler(i);
                                return (
                                    <OptionAnimation.wrapper
                                        key={`change-progression-option-${i}`}
                                    >
                                        <CSSTransition
                                            in={
                                                getState().progressionActive[
                                                    getProgressionString(
                                                        progression,
                                                        i
                                                    )
                                                ]
                                            }
                                            timeout={OptionAnimation.timeout}
                                            classNames="option-shrink"
                                            onEntered={onComplete}
                                            onExited={onComplete}
                                        >
                                            <ProgressionOption
                                                onClick={onClick}
                                                progressionIndex={i}
                                                progression={progression}
                                                selected={
                                                    i ===
                                                    currentProgressionIndex
                                                }
                                            />
                                        </CSSTransition>
                                    </OptionAnimation.wrapper>
                                );
                            })}
                        </FlexRow>
                    </OverflowContainerDiv>
                </SelectorContainer>
            </FlexRow>
        </ProgressionSelectorContainer>
    );
};
