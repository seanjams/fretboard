import React, { useEffect } from "react";
import {
    useStateRef,
    AppStore,
    AudioStore,
    current,
    DEFAULT_SLIDER_STATE,
} from "../../store";
import { ArrowTypes } from "../../types";
import {
    COLORS,
    HIGHLIGHTED,
    SELECTED,
    BRUSH_MODES,
    STRUM_LOW_TO_HIGH,
    ARPEGGIATE_LOW_TO_HIGH,
} from "../../utils";
import { CircleControlsContainer, Label } from "./style";
import { CircleIconButton, HighlightButton } from "../buttons";
import PlusIcon from "../../assets/icons/plus.png";
import MinusIcon from "../../assets/icons/minus.png";
import LeftIcon from "../../assets/icons/left-arrow.png";
import DownIcon from "../../assets/icons/down-arrow.png";
import UpIcon from "../../assets/icons/up-arrow.png";
import RightIcon from "../../assets/icons/right-arrow.png";
import ClearIcon from "../../assets/icons/clear.png";

const [secondaryColor, primaryColor] = COLORS[0];

interface Props {
    store: AppStore;
}

interface PositionControlProps extends Props {
    audioStore: AudioStore;
}

export const PositionControls: React.FC<PositionControlProps> = ({
    store,
    audioStore,
}) => {
    const onArrowPress = (dir: ArrowTypes) => () => {
        const { invert, leftHand, strumMode } = store.state;

        // Get the action direction based on orientation of fretboard
        // could maybe move this to reducer.
        // highEBottom
        // 	- whether the high E string appears on the top or bottom of the fretboard,
        // 	- depending on invert/leftHand views
        const highEBottom = invert !== leftHand;
        const up = (dir === "ArrowDown" && highEBottom) || dir === "ArrowUp";
        const down = (dir === "ArrowUp" && highEBottom) || dir === "ArrowDown";
        const right = (dir === "ArrowLeft" && invert) || dir === "ArrowRight";
        const left = (dir === "ArrowRight" && invert) || dir === "ArrowLeft";
        let playSound = up || down || left || right;

        if (up) {
            store.dispatch.incrementPositionY();
        } else if (down) {
            store.dispatch.decrementPositionY();
        } else if (right) {
            store.dispatch.incrementPositionX();
        } else if (left) {
            store.dispatch.decrementPositionX();
        }

        if (playSound) {
            const { fretboard } = current(store.state);
            if (strumMode === STRUM_LOW_TO_HIGH)
                audioStore.strumChord(fretboard);
            else {
                audioStore.arpeggiateChord(fretboard);
            }
        }
    };

    return (
        <CircleControlsContainer>
            <div className="circle-button-container">
                <CircleIconButton
                    onClick={onArrowPress("ArrowLeft")}
                    imageSrc={LeftIcon}
                />
                <Label>{""}</Label>
            </div>
            <div className="circle-button-container">
                <CircleIconButton
                    onClick={onArrowPress("ArrowDown")}
                    imageSrc={DownIcon}
                />
                <Label>{""}</Label>
            </div>
            <div className="circle-button-container">
                <CircleIconButton
                    onClick={onArrowPress("ArrowUp")}
                    imageSrc={UpIcon}
                />
                <Label>{""}</Label>
            </div>
            <div className="circle-button-container">
                <CircleIconButton
                    onClick={onArrowPress("ArrowRight")}
                    imageSrc={RightIcon}
                />
                <Label>{""}</Label>
            </div>
        </CircleControlsContainer>
    );
};

export const HighlightControls: React.FC<Props> = ({ store }) => {
    const [getState, setState] = useStateRef(() => ({
        status: store.state.status,
    }));
    const { status } = getState();

    useEffect(() => {
        return store.addListener(({ status, strumMode }) => {
            if (getState().status !== status) {
                setState({ status });
            }
        });
    }, []);

    const onStatusChange = (event: MouseEvent | TouchEvent) => {
        event.preventDefault();
        const { status } = store.state;
        store.dispatch.setStatus(
            status === HIGHLIGHTED ? SELECTED : HIGHLIGHTED
        );
    };

    const onClearNotes = () => {
        store.dispatch.clear();
    };

    const onClearHighlight = () => {
        store.dispatch.clearHighlight();
    };

    const onShowSettings = () => {
        store.dispatch.setShowSettings(!store.state.showSettings);
    };

    return (
        <CircleControlsContainer>
            <div className="circle-button-container">
                <CircleIconButton onClick={onClearNotes} imageSrc={ClearIcon} />
                <Label>{""}</Label>
            </div>
            <div className="circle-button-container">
                <CircleIconButton
                    onClick={onClearHighlight}
                    imageSrc={ClearIcon}
                />
                <Label>{"clear highlight"}</Label>
            </div>
            <div className="circle-button-container">
                <HighlightButton onClick={onStatusChange} />
                <Label>
                    {status === HIGHLIGHTED && BRUSH_MODES[HIGHLIGHTED]}
                </Label>
            </div>
            <div className="circle-button-container">
                <CircleIconButton
                    onClick={onShowSettings}
                    imageSrc={ClearIcon}
                />
                <Label>Settings</Label>
            </div>
        </CircleControlsContainer>
    );
};

export const SliderControls: React.FC<Props> = ({ store }) => {
    return (
        <CircleControlsContainer>
            <div className="circle-button-container">
                <CircleIconButton
                    onClick={store.dispatch.addFretboard}
                    imageSrc={PlusIcon}
                />
            </div>
            <div className="circle-button-container">
                <CircleIconButton
                    onClick={store.dispatch.removeFretboard}
                    imageSrc={MinusIcon}
                />
            </div>
        </CircleControlsContainer>
    );
};

export const FretboardSettingsControls: React.FC<PositionControlProps> = ({
    store,
    audioStore,
}) => {
    const [getState, setState] = useStateRef(() => ({
        strumMode: store.state.strumMode,
        isMuted: audioStore.state.isMuted,
    }));
    const { strumMode, isMuted } = getState();

    useEffect(() => {
        const destroyAppStateListener = store.addListener(({ strumMode }) => {
            if (getState().strumMode !== strumMode) setState({ strumMode });
        });
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
        const { strumMode } = store.state;
        store.dispatch.setStrumMode(
            strumMode === STRUM_LOW_TO_HIGH
                ? ARPEGGIATE_LOW_TO_HIGH
                : STRUM_LOW_TO_HIGH
        );
    };

    return (
        <CircleControlsContainer>
            <div className="circle-button-container">
                <CircleIconButton
                    onClick={store.dispatch.toggleLeftHand}
                    imageSrc={ClearIcon}
                />
                <Label>Left Hand</Label>
            </div>
            <div className="circle-button-container">
                <CircleIconButton
                    onClick={store.dispatch.toggleInvert}
                    imageSrc={ClearIcon}
                />
                <Label>Invert</Label>
            </div>
            <div className="circle-button-container">
                <CircleIconButton
                    onClick={onStrumModeChange}
                    imageSrc={ClearIcon}
                />
                <Label>
                    {strumMode === STRUM_LOW_TO_HIGH ? "strum" : "arpeggiate"}
                </Label>
            </div>
            <div className="circle-button-container">
                <CircleIconButton
                    onClick={audioStore.dispatch.toggleMute}
                    imageSrc={ClearIcon}
                />
                <Label>{isMuted ? "mute" : "unmute"}</Label>
            </div>
        </CircleControlsContainer>
    );
};
