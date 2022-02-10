import React, { useState, useEffect } from "react";
import { CSSTransition } from "react-transition-group";
import {
    useStateRef,
    AppStore,
    AudioStore,
    useTouchHandlers,
    getComputedAppState,
} from "../../store";
import { ArrowTypes, DisplayTypes, ReactMouseEvent } from "../../types";
import {
    HIGHLIGHTED,
    SELECTED,
    STRUM_LOW_TO_HIGH,
    ARPEGGIATE_LOW_TO_HIGH,
} from "../../utils";
import {
    CircleControlsContainer,
    HighlightCheckboxAnimation,
    Label,
} from "./style";
import { CircleIconButton } from "../Button";
import { Checkbox } from "../Checkbox";
import { Div, FlexRow } from "../Common";
import PlusIcon from "../../assets/icons/plus.png";
import MinusIcon from "../../assets/icons/minus.png";
import LeftIcon from "../../assets/icons/left-arrow.png";
import DownIcon from "../../assets/icons/down-arrow.png";
import UpIcon from "../../assets/icons/up-arrow.png";
import RightIcon from "../../assets/icons/right-arrow.png";
import ClearIcon from "../../assets/icons/clear.png";

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
        <CircleControlsContainer>
            <Div className="circle-button-container">
                <CircleIconButton
                    onClick={onArrowPress("ArrowLeft")}
                    imageSrc={LeftIcon}
                />
                <Label>{""}</Label>
            </Div>
            <Div className="circle-button-container">
                <CircleIconButton
                    onClick={onArrowPress("ArrowDown")}
                    imageSrc={DownIcon}
                />
                <Label>{""}</Label>
            </Div>
            <Div className="circle-button-container">
                <CircleIconButton
                    onClick={onArrowPress("ArrowUp")}
                    imageSrc={UpIcon}
                />
                <Label>{""}</Label>
            </Div>
            <Div className="circle-button-container">
                <CircleIconButton
                    onClick={onArrowPress("ArrowRight")}
                    imageSrc={RightIcon}
                />
                <Label>{""}</Label>
            </Div>
        </CircleControlsContainer>
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
                            <Label>{""}</Label>
                        </Div>

                        <Div className="circle-button-container clear-button">
                            <CircleIconButton
                                onClick={onClear}
                                imageSrc={ClearIcon}
                            />
                            <Label>clear</Label>
                        </Div>
                    </FlexRow>
                </CSSTransition>
            </HighlightCheckboxAnimation.wrapper>
        </FlexRow>
    );
};

export const SliderControls: React.FC<ControlsProps> = ({ appStore }) => {
    return (
        <CircleControlsContainer>
            <Div className="circle-button-container">
                <CircleIconButton
                    onClick={appStore.dispatch.addFretboard}
                    imageSrc={PlusIcon}
                />
            </Div>
            <Div className="circle-button-container">
                <CircleIconButton
                    onClick={appStore.dispatch.removeFretboard}
                    imageSrc={MinusIcon}
                />
            </Div>
        </CircleControlsContainer>
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

    const onShowSettings = () => {
        let display: DisplayTypes =
            appStore.state.display === "settings" ? "normal" : "settings";
        appStore.dispatch.setDisplay(display);
    };

    const onShowInput = () => {
        let display: DisplayTypes =
            appStore.state.display === "chord-input" ? "normal" : "chord-input";
        appStore.dispatch.setDisplay(display);
    };

    return (
        <CircleControlsContainer>
            <Div className="circle-button-container">
                <CircleIconButton
                    onClick={onShowSettings}
                    imageSrc={ClearIcon}
                    selected={display === "settings"}
                />
                <Label>Settings</Label>
            </Div>
            <Div className="circle-button-container">
                <CircleIconButton
                    onClick={onShowInput}
                    imageSrc={PlusIcon}
                    selected={display === "chord-input"}
                />
                <Label>Input</Label>
            </Div>
        </CircleControlsContainer>
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
        <CircleControlsContainer>
            <Div className="circle-button-container">
                <CircleIconButton onClick={onPlayNotes} imageSrc={PlusIcon} />
                <Label>Play</Label>
            </Div>
        </CircleControlsContainer>
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
        <FlexRow width="100%" justifyContent="space-between">
            <Checkbox
                checked={label === "sharp"}
                leftLabel="Flat"
                rightLabel="Sharp"
                onClick={onLabelChange}
            />
            <Checkbox
                checked={!!leftHand}
                leftLabel="Right Hand"
                rightLabel="Left Hand"
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
    );
};
