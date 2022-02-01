import React, { useEffect } from "react";
import { CSSTransition } from "react-transition-group";
import { useStateRef, AppStore, AudioStore } from "../../store";
import { ArrowTypes, DisplayTypes } from "../../types";
import {
    HIGHLIGHTED,
    SELECTED,
    STRUM_LOW_TO_HIGH,
    ARPEGGIATE_LOW_TO_HIGH,
} from "../../utils";
import {
    CircleControlsContainer,
    Label,
    HighlightCheckboxAnimationWrapper,
} from "./style";
import { CircleIconButton } from "../Button";
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

interface PositionControlsProps extends ControlsProps {
    audioStore: AudioStore;
}

export const PositionControls: React.FC<PositionControlsProps> = ({
    appStore,
    audioStore,
}) => {
    const onArrowPress = (dir: ArrowTypes) => () => {
        appStore.dispatch.setHighlightedPosition(dir);
        const { fretboard, strumMode } = appStore.getComputedState();
        // add small delay to chordSound for scrolling to complete, less jarring
        strumMode === STRUM_LOW_TO_HIGH
            ? setTimeout(() => audioStore.strumChord(fretboard), 150)
            : setTimeout(() => audioStore.arpeggiateChord(fretboard), 150);
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

    const onStatusChange = (
        event:
            | React.MouseEvent<HTMLDivElement, MouseEvent>
            | React.TouchEvent<HTMLDivElement>
    ) => {
        event.preventDefault();
        const { status } = appStore.state;
        appStore.dispatch.setStatus(
            status === HIGHLIGHTED ? SELECTED : HIGHLIGHTED
        );
    };

    const onClear = () => {
        const { status } = appStore.state;
        if (status === HIGHLIGHTED) {
            appStore.dispatch.clearHighlight();
        } else {
            appStore.dispatch.clear();
        }
    };

    return (
        <FlexRow>
            <HighlightCheckboxAnimationWrapper>
                <CSSTransition
                    in={status === HIGHLIGHTED}
                    timeout={{ enter: 150, exit: 150 }}
                    classNames="highlight-slide"
                >
                    <FlexRow className="highlight-form">
                        <Div>
                            <Div
                                className="highlight-checkbox"
                                onTouchStart={onStatusChange}
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
            </HighlightCheckboxAnimationWrapper>
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

interface FretboardSettingsControlsProps extends ControlsProps {
    audioStore: AudioStore;
}

export const FretboardSettingsControls: React.FC<FretboardSettingsControlsProps> =
    ({ appStore, audioStore }) => {
        const [getState, setState] = useStateRef(() => ({
            strumMode: appStore.state.strumMode,
            isMuted: audioStore.state.isMuted,
        }));
        const { strumMode, isMuted } = getState();

        useEffect(() => {
            const destroyAppStateListener = appStore.addListener(
                ({ strumMode }) => {
                    if (getState().strumMode !== strumMode)
                        setState({ strumMode });
                }
            );
            const destroyAudioStateListener = audioStore.addListener(
                ({ isMuted }) => {
                    if (getState().isMuted !== isMuted) setState({ isMuted });
                }
            );
            return () => {
                destroyAppStateListener();
                destroyAudioStateListener();
            };
        }, []);

        const onStrumModeChange = (event: MouseEvent | TouchEvent) => {
            event.preventDefault();
            const { strumMode } = appStore.state;
            appStore.dispatch.setStrumMode(
                strumMode === STRUM_LOW_TO_HIGH
                    ? ARPEGGIATE_LOW_TO_HIGH
                    : STRUM_LOW_TO_HIGH
            );
        };

        const onLabelChange = (event: MouseEvent | TouchEvent) => {
            event.preventDefault();
            const { label } = appStore.getComputedState().progression;
            appStore.dispatch.setLabel(label === "sharp" ? "flat" : "sharp");
        };

        return (
            <CircleControlsContainer>
                <Div className="circle-button-container">
                    <CircleIconButton
                        onClick={onLabelChange}
                        imageSrc={ClearIcon}
                    />
                    <Label>Label</Label>
                </Div>
                <Div className="circle-button-container">
                    <CircleIconButton
                        onClick={appStore.dispatch.toggleLeftHand}
                        imageSrc={ClearIcon}
                    />
                    <Label>Left Hand</Label>
                </Div>
                <Div className="circle-button-container">
                    <CircleIconButton
                        onClick={appStore.dispatch.toggleInvert}
                        imageSrc={ClearIcon}
                    />
                    <Label>Invert</Label>
                </Div>
                <Div className="circle-button-container">
                    <CircleIconButton
                        onClick={onStrumModeChange}
                        imageSrc={ClearIcon}
                    />
                    <Label>
                        {strumMode === STRUM_LOW_TO_HIGH
                            ? "strum"
                            : "arpeggiate"}
                    </Label>
                </Div>
                <Div className="circle-button-container">
                    <CircleIconButton
                        onClick={audioStore.dispatch.toggleMute}
                        imageSrc={ClearIcon}
                    />
                    <Label>{isMuted ? "mute" : "unmute"}</Label>
                </Div>
            </CircleControlsContainer>
        );
    };

interface SettingsButtonStateType {
    display: DisplayTypes;
}

export const SettingsButton: React.FC<ControlsProps> = ({ appStore }) => {
    const [getState, setState] = useStateRef<SettingsButtonStateType>(() => ({
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

interface PlayButtonProps extends ControlsProps {
    audioStore: AudioStore;
}

export const PlayButton: React.FC<PlayButtonProps> = ({
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
