import React, { useState, useEffect } from "react";
import { CSSTransition } from "react-transition-group";
import {
    useStateRef,
    AppStore,
    AudioStore,
    useTouchHandlers,
    getComputedAppState,
} from "../../store";
import {
    ArrowTypes,
    DisplayTypes,
    ReactMouseEvent,
    WindowMouseEvent,
} from "../../types";
import {
    HIGHLIGHTED,
    SELECTED,
    STRUM_LOW_TO_HIGH,
    ARPEGGIATE_LOW_TO_HIGH,
    SAFETY_AREA_MARGIN,
    lightGrey,
} from "../../utils";
import {
    PillControlsContainer,
    HighlightCheckboxAnimation,
    Label,
} from "./style";
import { Checkbox } from "../Checkbox";
import { Div, FlexRow } from "../Common";
import { IconButton } from "../IconButton";
import PlusIcon from "../../assets/icons/plus.svg";
import MinusIcon from "../../assets/icons/minus.svg";

import PlayIcon from "../../assets/icons/play.svg";
import SaveIcon from "../../assets/icons/database.svg";
import ChordIcon from "../../assets/icons/music.svg";
import TrashIcon from "../../assets/icons/bin.svg";
import CogIcon from "../../assets/icons/cog.svg";

import LeftArrowIcon from "../../assets/icons/arrow-left.svg";
import RightArrowIcon from "../../assets/icons/arrow-right.svg";
import UpArrowIcon from "../../assets/icons/arrow-up.svg";
import DownArrowIcon from "../../assets/icons/arrow-down.svg";

interface ControlsProps {
    appStore: AppStore;
}

interface AudioControlsProps extends ControlsProps {
    audioStore: AudioStore;
}

export const PositionControls: React.FC<AudioControlsProps> = ({
    appStore,
    audioStore,
}) => {
    const onArrowPress = (dir: ArrowTypes) => () => {
        appStore.dispatch.setHighlightedPosition(dir);
    };

    return (
        <PillControlsContainer>
            <Div className="pill-button-container">
                <IconButton
                    onClick={onArrowPress("ArrowLeft")}
                    imageSrc={LeftArrowIcon}
                    iconHeight={18}
                    iconWidth={18}
                />
            </Div>
            <Div className="pill-button-container">
                <IconButton
                    onClick={onArrowPress("ArrowDown")}
                    imageSrc={DownArrowIcon}
                    iconHeight={18}
                    iconWidth={18}
                />
            </Div>
            <Div className="pill-button-container">
                <IconButton
                    onClick={onArrowPress("ArrowUp")}
                    imageSrc={UpArrowIcon}
                    iconHeight={18}
                    iconWidth={18}
                />
            </Div>
            <Div className="pill-button-container">
                <IconButton
                    onClick={onArrowPress("ArrowRight")}
                    imageSrc={RightArrowIcon}
                    iconHeight={18}
                    iconWidth={18}
                />
            </Div>
        </PillControlsContainer>
    );
};

export const HighlightControls: React.FC<ControlsProps> = ({ appStore }) => {
    const [getState, setState] = useStateRef(() => ({
        status: appStore.state.status,
    }));
    const { status } = getState();

    useEffect(() => {
        return appStore.addListener(({ status, strumMode }) => {
            if (getState().status !== status) {
                setState({ status });
            }
        });
    }, []);

    const onClear = () => {
        const { status } = appStore.state;
        if (status === HIGHLIGHTED) {
            appStore.dispatch.clearHighlight();
        } else {
            appStore.dispatch.clear();
        }
    };

    const touchHandlers = useTouchHandlers({
        // change status
        onStart: (event: ReactMouseEvent) => {
            event.preventDefault();
            const { status } = appStore.state;
            appStore.dispatch.setStatus(
                status === HIGHLIGHTED ? SELECTED : HIGHLIGHTED
            );
        },
    });

    return (
        <FlexRow>
            <HighlightCheckboxAnimation.wrapper>
                <CSSTransition
                    in={status === HIGHLIGHTED}
                    timeout={HighlightCheckboxAnimation.timeout}
                    classNames="highlight-slide"
                >
                    <FlexRow className="highlight-form">
                        <Div>
                            <Div
                                className="highlight-checkbox"
                                {...touchHandlers}
                            >
                                <Div />
                            </Div>
                        </Div>

                        <Div className="pill-button-container clear-button">
                            <IconButton
                                onClick={onClear}
                                imageSrc={TrashIcon}
                                iconHeight={18}
                                iconWidth={18}
                                isCircular={true}
                            />
                        </Div>
                    </FlexRow>
                </CSSTransition>
            </HighlightCheckboxAnimation.wrapper>
        </FlexRow>
    );
};

export const SliderControls: React.FC<ControlsProps> = ({ appStore }) => {
    return (
        <PillControlsContainer>
            <Div className="pill-button-container">
                <IconButton
                    onClick={appStore.dispatch.addFretboard}
                    imageSrc={PlusIcon}
                />
            </Div>
            <Div className="pill-button-container">
                <IconButton
                    onClick={appStore.dispatch.removeFretboard}
                    imageSrc={MinusIcon}
                />
            </Div>
        </PillControlsContainer>
    );
};

export const DrawerControls: React.FC<ControlsProps> = ({ appStore }) => {
    const [getState, setState] = useStateRef(() => ({
        display: appStore.state.display,
    }));
    const { display } = getState();

    useEffect(() => {
        return appStore.addListener(({ display }) => {
            if (getState().display !== display) setState({ display });
        });
    }, []);

    const onShowDisplay = (display: DisplayTypes) => () => {
        appStore.dispatch.setDisplay(
            appStore.state.display === display ? "normal" : display
        );
    };

    return (
        <PillControlsContainer>
            <Div className="pill-button-container">
                <IconButton
                    onClick={onShowDisplay("settings")}
                    imageSrc={CogIcon}
                    selected={display === "settings"}
                />
            </Div>
            <Div className="pill-button-container">
                <IconButton
                    onClick={onShowDisplay("change-chord")}
                    imageSrc={ChordIcon}
                    selected={display === "change-chord"}
                />
            </Div>
            <Div className="pill-button-container">
                <IconButton
                    onClick={onShowDisplay("change-progression")}
                    imageSrc={SaveIcon}
                    selected={display === "change-progression"}
                />
            </Div>
        </PillControlsContainer>
    );
};

export const AudioControls: React.FC<AudioControlsProps> = ({
    appStore,
    audioStore,
}) => {
    const onPlayNotes = () => {
        const { fretboard, strumMode } = appStore.getComputedState();
        if (strumMode === STRUM_LOW_TO_HIGH) {
            audioStore.strumChord(fretboard);
        } else {
            audioStore.arpeggiateChord(fretboard);
        }
    };

    return (
        <FlexRow justifyContent="start">
            <IconButton
                onClick={onPlayNotes}
                imageSrc={PlayIcon}
                iconHeight={22}
                iconWidth={22}
                isCircular={true}
            />
        </FlexRow>
    );
};

export const SettingsControls: React.FC<AudioControlsProps> = ({
    appStore,
    audioStore,
}) => {
    const { progression } = appStore.getComputedState();
    const [getState, setState] = useStateRef(() => ({
        strumMode: appStore.state.strumMode,
        isMuted: audioStore.state.isMuted,
        label: progression.label,
        leftHand: appStore.state.leftHand,
        invert: appStore.state.invert,
    }));
    const { strumMode, isMuted, label, leftHand, invert } = getState();

    useEffect(
        () =>
            appStore.addListener((newState) => {
                const { progression, strumMode, leftHand, invert } =
                    getComputedAppState(newState);
                const { label } = progression;
                if (
                    getState().strumMode !== strumMode ||
                    getState().label !== label ||
                    getState().leftHand !== leftHand ||
                    getState().invert !== invert
                )
                    setState({ strumMode, label, leftHand, invert });
            }),
        []
    );

    useEffect(
        () =>
            audioStore.addListener(({ isMuted }) => {
                if (getState().isMuted !== isMuted) setState({ isMuted });
            }),
        []
    );

    const onStrumModeChange = (event: ReactMouseEvent) => {
        event.preventDefault();
        const { strumMode } = appStore.state;
        appStore.dispatch.setStrumMode(
            strumMode === STRUM_LOW_TO_HIGH
                ? ARPEGGIATE_LOW_TO_HIGH
                : STRUM_LOW_TO_HIGH
        );
    };

    const onLabelChange = (event: ReactMouseEvent) => {
        event.preventDefault();
        const { label } = appStore.getComputedState().progression;
        appStore.dispatch.setLabel(label === "sharp" ? "flat" : "sharp");
    };

    return (
        <Div
            padding={`0 ${SAFETY_AREA_MARGIN}px`}
            height="100%"
            width={`calc(100% - ${2 * SAFETY_AREA_MARGIN}px)`}
        >
            <Div fontSize="10px" color={lightGrey} width="100%" height="10%">
                Settings
            </Div>
            <FlexRow
                height="90%"
                padding={`0 ${SAFETY_AREA_MARGIN}px`}
                justifyContent="space-between"
            >
                <Checkbox
                    checked={label === "sharp"}
                    leftLabel="Flat"
                    rightLabel="Sharp"
                    onClick={onLabelChange}
                />
                <Checkbox
                    checked={!!leftHand}
                    leftLabel="Right"
                    rightLabel="Left"
                    onClick={appStore.dispatch.toggleLeftHand}
                />
                <Checkbox
                    checked={!!invert}
                    leftLabel="Not"
                    rightLabel="Invert"
                    onClick={appStore.dispatch.toggleInvert}
                />
                <Checkbox
                    checked={strumMode !== STRUM_LOW_TO_HIGH}
                    leftLabel="Strum"
                    rightLabel="Arpeggiate"
                    onClick={onStrumModeChange}
                />
                <Checkbox
                    checked={isMuted}
                    leftLabel="Unmute"
                    rightLabel="Mute"
                    onClick={audioStore.dispatch.toggleMute}
                />
            </FlexRow>
        </Div>
    );
};

interface ProgressionControlsProps extends ControlsProps {
    onAddClick: (event: WindowMouseEvent) => void;
    onRemoveClick: (event: WindowMouseEvent) => void;
}

export const ProgressionControls: React.FC<ProgressionControlsProps> = ({
    appStore,
    onAddClick,
    onRemoveClick,
}) => {
    return (
        <PillControlsContainer>
            <Div className="pill-button-container">
                <IconButton onClick={onAddClick} imageSrc={PlusIcon} />
            </Div>
            <Div className="pill-button-container">
                <IconButton onClick={onRemoveClick} imageSrc={MinusIcon} />
            </Div>
        </PillControlsContainer>
    );
};
