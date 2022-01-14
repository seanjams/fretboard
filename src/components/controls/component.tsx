import React, { useEffect } from "react";
import { useStateRef, AppStore, AudioStore } from "../../store";
import { ArrowTypes } from "../../types";
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

interface Props {
    appStore: AppStore;
}

interface PositionControlProps extends Props {
    audioStore: AudioStore;
}

export const PositionControls: React.FC<PositionControlProps> = ({
    appStore,
    audioStore,
}) => {
    const onArrowPress = (dir: ArrowTypes) => () => {
        appStore.dispatch.setHighlightedPosition(dir);
        const { fretboard, strumMode } = appStore.getComputedState();
        strumMode === STRUM_LOW_TO_HIGH
            ? audioStore.strumChord(fretboard)
            : audioStore.arpeggiateChord(fretboard);
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

export const HighlightControls: React.FC<Props> = ({ appStore }) => {
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

    const onShowSettings = () => {
        appStore.dispatch.setShowSettings(!appStore.state.showSettings);
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

export const SliderControls: React.FC<Props> = ({ appStore }) => {
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

interface FretboardSettingsControlProps extends Props {
    audioStore: AudioStore;
}

export const FretboardSettingsControls: React.FC<FretboardSettingsControlProps> =
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

interface PlayButtonProps extends Props {
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
            </Div>
        </CircleControlsContainer>
    );
};

export const SettingsButton: React.FC<Props> = ({ appStore }) => {
    // const [getState, setState] = useStateRef(() => ({
    //     showSettings: appStore.state.showSettings,
    // }));
    // const { showSettings } = getState(); // use to flip arrow around

    // useEffect(() => {
    //     return appStore.addListener(({ showSettings }) => {
    //         if (getState().showSettings !== showSettings) {
    //             setState({ showSettings });
    //         }
    //     });
    // }, []);

    const onShowSettings = () => {
        appStore.dispatch.setShowSettings(!appStore.state.showSettings);
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
