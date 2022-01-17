import React, { useEffect } from "react";
import { useStateRef, AppStore, AudioStore } from "../../store";
import { ArrowTypes, DisplayTypes } from "../../types";
import {
    HIGHLIGHTED,
    SELECTED,
    BRUSH_MODES,
    STRUM_LOW_TO_HIGH,
    ARPEGGIATE_LOW_TO_HIGH,
} from "../../utils";
import { CircleControlsContainer, Label } from "./style";
import { CircleIconButton, HighlightButton } from "../Button";
import { Div } from "../Common";
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

    const onStatusChange = (event: MouseEvent | TouchEvent) => {
        event.preventDefault();
        const { status } = appStore.state;
        appStore.dispatch.setStatus(
            status === HIGHLIGHTED ? SELECTED : HIGHLIGHTED
        );
    };

    const onClearNotes = () => {
        appStore.dispatch.clear();
    };

    const onClearHighlight = () => {
        appStore.dispatch.clearHighlight();
    };

    return (
        <CircleControlsContainer>
            <Div className="circle-button-container">
                <CircleIconButton onClick={onClearNotes} imageSrc={ClearIcon} />
                <Label>{""}</Label>
            </Div>
            <Div className="circle-button-container">
                <CircleIconButton
                    onClick={onClearHighlight}
                    imageSrc={ClearIcon}
                />
                <Label>{"clear highlight"}</Label>
            </Div>
            <Div className="circle-button-container">
                <HighlightButton onClick={onStatusChange} />
                <Label>
                    {status === HIGHLIGHTED && BRUSH_MODES[HIGHLIGHTED]}
                </Label>
            </Div>
        </CircleControlsContainer>
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

        return (
            <CircleControlsContainer>
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

    const onShowSlider = () => {
        let display: DisplayTypes =
            appStore.state.display === "slider" ? "normal" : "slider";
        appStore.dispatch.setDisplay(display);
    };

    const onShowInput = () => {
        let display: DisplayTypes =
            appStore.state.display === "input" ? "normal" : "input";
        appStore.dispatch.setDisplay(display);
    };

    return (
        <CircleControlsContainer>
            <Div className="circle-button-container">
                <CircleIconButton onClick={onPlayNotes} imageSrc={PlusIcon} />
                <Label>Play</Label>
            </Div>
            <Div className="circle-button-container">
                <CircleIconButton onClick={onShowSlider} imageSrc={PlusIcon} />
                <Label>Slider</Label>
            </Div>
            <Div className="circle-button-container">
                <CircleIconButton onClick={onShowInput} imageSrc={PlusIcon} />
                <Label>Input</Label>
            </Div>
        </CircleControlsContainer>
    );
};

export const SettingsButton: React.FC<ControlsProps> = ({ appStore }) => {
    // const [getState, setState] = useStateRef(() => ({
    //     showBottomDrawer: appStore.state.showBottomDrawer,
    // }));
    // const { showBottomDrawer } = getState(); // use to flip arrow around

    // useEffect(() => {
    //     return appStore.addListener(({ showBottomDrawer }) => {
    //         if (getState().showBottomDrawer !== showBottomDrawer) {
    //             setState({ showBottomDrawer });
    //         }
    //     });
    // }, []);

    const onShowSettings = () => {
        let display: DisplayTypes =
            appStore.state.display === "settings" ? "normal" : "settings";
        appStore.dispatch.setDisplay(display);
    };

    return (
        <CircleControlsContainer>
            <Div className="circle-button-container">
                <CircleIconButton
                    onClick={onShowSettings}
                    imageSrc={ClearIcon}
                />
                <Label>Settings</Label>
            </Div>
        </CircleControlsContainer>
    );
};
