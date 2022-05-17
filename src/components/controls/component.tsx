import React, { useEffect, useRef, useState } from "react";
import { icons } from "../../assets/icons/icons";
import {
    AppStore,
    AudioStore,
    useTouchHandlers,
    getComputedAppState,
    useDerivedState,
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
    COLORS,
    SP,
} from "../../utils";
import { Checkbox } from "../Checkbox";
import { Div, FlexRow } from "../Common";
import { IconButton } from "../Buttons";
import {
    PillControlsContainer,
    HighlightCheckboxAnimation,
    HighlightCheckboxContainer,
    Label,
    PillButtonLabel,
} from "./style";

interface ControlsProps {
    appStore: AppStore;
}

interface AudioControlsProps extends ControlsProps {
    audioStore: AudioStore;
}

export const PositionControls: React.FC<ControlsProps> = ({ appStore }) => {
    const [getState, setState] = useDerivedState(
        appStore,
        deriveStateFromAppState
    );
    const { backgroundColor } = getState();

    function deriveStateFromAppState(appState: typeof appStore.state) {
        const { currentVisibleFretboardIndex } = getComputedAppState(appState);
        return {
            backgroundColor: COLORS[currentVisibleFretboardIndex][2],
        };
    }

    const onArrowPress = (dir: ArrowTypes) => () => {
        appStore.dispatch.setHighlightedPosition(dir);
    };

    return (
        <PillControlsContainer>
            <Div className="pill-button-container">
                <IconButton
                    onClick={onArrowPress("ArrowLeft")}
                    iconHeight={18}
                    iconWidth={18}
                    activeColor={backgroundColor}
                >
                    {icons.arrowLeft}
                </IconButton>
            </Div>
            <Div className="pill-button-container">
                <IconButton
                    onClick={onArrowPress("ArrowDown")}
                    iconHeight={18}
                    iconWidth={18}
                    activeColor={backgroundColor}
                >
                    {icons.arrowDown}
                </IconButton>
            </Div>
            <Div className="pill-button-container">
                <IconButton
                    onClick={onArrowPress("ArrowUp")}
                    iconHeight={18}
                    iconWidth={18}
                    activeColor={backgroundColor}
                >
                    {icons.arrowUp}
                </IconButton>
            </Div>
            <Div className="pill-button-container">
                <IconButton
                    onClick={onArrowPress("ArrowRight")}
                    iconHeight={18}
                    iconWidth={18}
                    activeColor={backgroundColor}
                >
                    {icons.arrowRight}
                </IconButton>
            </Div>
        </PillControlsContainer>
    );
};

export const HighlightControls: React.FC<ControlsProps> = ({ appStore }) => {
    const [getState, setState] = useDerivedState(
        appStore,
        deriveStateFromAppState
    );
    const { status, backgroundColor } = getState();

    function deriveStateFromAppState(appState: typeof appStore.state) {
        const { status, currentVisibleFretboardIndex } =
            getComputedAppState(appState);
        return {
            status,
            backgroundColor: COLORS[currentVisibleFretboardIndex][1],
        };
    }

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
        onClick: (event: WindowMouseEvent) => {
            event.preventDefault();
            const { display, status } = appStore.state;
            if (display !== "normal") appStore.dispatch.setDisplay("normal");
            appStore.dispatch.setStatus(
                status === HIGHLIGHTED ? SELECTED : HIGHLIGHTED
            );
        },
    });

    return (
        <FlexRow>
            <HighlightCheckboxAnimation
                appear
                trigger={status === HIGHLIGHTED}
                highlightColor={backgroundColor}
            >
                <HighlightCheckboxContainer>
                    <Div>
                        <Div className="highlight-checkbox" {...touchHandlers}>
                            <Div />
                        </Div>
                    </Div>

                    <Div className="pill-button-container clear-button">
                        <IconButton
                            onClick={onClear}
                            iconHeight={18}
                            iconWidth={18}
                            isCircular={true}
                        >
                            {icons.bin}
                        </IconButton>
                    </Div>
                </HighlightCheckboxContainer>
            </HighlightCheckboxAnimation>
        </FlexRow>
    );
};

export const SliderControls: React.FC<ControlsProps> = ({ appStore }) => {
    const [getState, setState] = useDerivedState(
        appStore,
        deriveStateFromAppState
    );
    const { backgroundColor } = getState();

    function deriveStateFromAppState(appState: typeof appStore.state) {
        const { currentVisibleFretboardIndex } = getComputedAppState(appState);
        return {
            backgroundColor: COLORS[currentVisibleFretboardIndex][2],
        };
    }

    return (
        <PillControlsContainer>
            <Div className="pill-button-container">
                <IconButton
                    onClick={appStore.dispatch.addFretboard}
                    activeColor={backgroundColor}
                >
                    {icons.plus}
                </IconButton>
            </Div>
            <Div className="pill-button-container">
                <IconButton
                    onClick={appStore.dispatch.removeFretboard}
                    activeColor={backgroundColor}
                >
                    {icons.minus}
                </IconButton>
            </Div>
        </PillControlsContainer>
    );
};

export const DrawerControls: React.FC<ControlsProps> = ({ appStore }) => {
    const [getState, setState] = useDerivedState(
        appStore,
        deriveStateFromAppState
    );
    const { display, backgroundColor } = getState();

    function deriveStateFromAppState(appState: typeof appStore.state) {
        const { display, currentVisibleFretboardIndex } =
            getComputedAppState(appState);
        return {
            display,
            backgroundColor: COLORS[currentVisibleFretboardIndex][2],
        };
    }

    const onShowDisplay = (newDisplay: DisplayTypes) => () => {
        const { display, status } = appStore.state;
        // if (status !== HIGHLIGHTED) appStore.dispatch.setStatus(HIGHLIGHTED);
        appStore.dispatch.setDisplay(
            display === newDisplay ? "normal" : newDisplay
        );
    };

    return (
        <PillControlsContainer>
            <Div className="pill-button-container">
                <IconButton
                    onClick={onShowDisplay("settings")}
                    selected={display === "settings"}
                    activeColor={backgroundColor}
                >
                    {icons.cog}
                </IconButton>
                <PillButtonLabel>Settings</PillButtonLabel>
            </Div>
            <Div className="pill-button-container">
                <IconButton
                    onClick={onShowDisplay("change-chord")}
                    selected={display === "change-chord"}
                    activeColor={backgroundColor}
                >
                    {icons.music}
                </IconButton>
                <PillButtonLabel>Chord</PillButtonLabel>
            </Div>
            <Div className="pill-button-container">
                <IconButton
                    onClick={onShowDisplay("change-progression")}
                    selected={display === "change-progression"}
                    activeColor={backgroundColor}
                >
                    {icons.database}
                </IconButton>
                <PillButtonLabel>Load</PillButtonLabel>
            </Div>
        </PillControlsContainer>
    );
};

export const AudioControls: React.FC<AudioControlsProps> = ({
    appStore,
    audioStore,
}) => {
    const [getState, setState] = useDerivedState(
        appStore,
        deriveStateFromAppState
    );
    const { backgroundColor } = getState();

    function deriveStateFromAppState(appState: typeof appStore.state) {
        const { currentVisibleFretboardIndex } = getComputedAppState(appState);
        return {
            backgroundColor: COLORS[currentVisibleFretboardIndex][2],
        };
    }

    const onPlayNotes = () => {
        const { fretboard, strumMode } = appStore.getComputedState();
        audioStore.strumChord(fretboard, strumMode !== STRUM_LOW_TO_HIGH);
    };

    const onStopNotes = () => {
        audioStore.stopAll();
    };

    return (
        <FlexRow justifyContent="space-between">
            <Div marginRight={`${SP[2]}px`}>
                <IconButton
                    onClick={onStopNotes}
                    iconHeight={22}
                    iconWidth={22}
                    isCircular={true}
                    activeColor={backgroundColor}
                >
                    {icons.stop}
                </IconButton>
            </Div>
            <Div>
                <IconButton
                    onClick={onPlayNotes}
                    iconHeight={22}
                    iconWidth={22}
                    isCircular={true}
                    activeColor={backgroundColor}
                >
                    {icons.play}
                </IconButton>
            </Div>
        </FlexRow>
    );
};

export const SettingsControls: React.FC<AudioControlsProps> = ({
    appStore,
    audioStore,
}) => {
    // handle app state
    const [getState, setState] = useDerivedState(
        appStore,
        deriveStateFromAppState
    );
    const { strumMode, label, leftHand, invert } = getState();
    // handle audio state manually
    const [isMuted, setIsMuted] = useState(audioStore.state.isMuted);
    const isMutedRef = useRef(isMuted);
    isMutedRef.current = isMuted;

    function deriveStateFromAppState(appState: typeof appStore.state) {
        const { progression, strumMode, leftHand, invert } =
            getComputedAppState(appState);
        const { label } = progression;
        return { strumMode, label, leftHand, invert };
    }

    useEffect(
        () =>
            audioStore.addListener(({ isMuted }) => {
                if (isMutedRef.current !== isMuted) setIsMuted(isMuted);
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
        <Div height="100%" width="100%">
            <FlexRow height="100%" width="100%" justifyContent="space-between">
                <Div>
                    <Label>Label</Label>
                    <Checkbox
                        checked={label === "sharp"}
                        leftLabel="Flat"
                        rightLabel="Sharp"
                        onClick={onLabelChange}
                    />
                </Div>
                <Div>
                    <Label>Hand</Label>
                    <Checkbox
                        checked={!leftHand}
                        leftLabel="Left"
                        rightLabel="Right"
                        onClick={appStore.dispatch.toggleLeftHand}
                    />
                </Div>
                <Div>
                    <Label>Y-Axis</Label>
                    <Checkbox
                        checked={!!invert}
                        leftLabel="Standard"
                        rightLabel="Invert"
                        onClick={appStore.dispatch.toggleInvert}
                    />
                </Div>

                <Div>
                    <Label>Strum Mode</Label>
                    <Checkbox
                        checked={strumMode !== STRUM_LOW_TO_HIGH}
                        leftLabel="Strum"
                        rightLabel="Arpeggiate"
                        onClick={onStrumModeChange}
                    />
                </Div>
                <Div>
                    <Label>Volume</Label>
                    <Checkbox
                        checked={isMuted}
                        leftLabel="Unmute"
                        rightLabel="Mute"
                        onClick={audioStore.dispatch.toggleMute}
                    />
                </Div>
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
    const [getState, setState] = useDerivedState(
        appStore,
        deriveStateFromAppState
    );
    const { backgroundColor } = getState();

    function deriveStateFromAppState(appState: typeof appStore.state) {
        const { currentVisibleFretboardIndex } = getComputedAppState(appState);
        return {
            backgroundColor: COLORS[currentVisibleFretboardIndex][2],
        };
    }

    return (
        <PillControlsContainer>
            <Div className="pill-button-container">
                <IconButton onClick={onAddClick} activeColor={backgroundColor}>
                    {icons.plus}
                </IconButton>
            </Div>
            <Div className="pill-button-container">
                <IconButton
                    onClick={onRemoveClick}
                    activeColor={backgroundColor}
                >
                    {icons.minus}
                </IconButton>
            </Div>
        </PillControlsContainer>
    );
};

export const InstructionsControls: React.FC<ControlsProps> = ({ appStore }) => {
    const [getState, setState] = useDerivedState(
        appStore,
        deriveStateFromAppState
    );
    const { backgroundColor, display } = getState();

    function deriveStateFromAppState(appState: typeof appStore.state) {
        const { currentVisibleFretboardIndex, display } =
            getComputedAppState(appState);
        return {
            backgroundColor: COLORS[currentVisibleFretboardIndex][2],
            display,
        };
    }

    const onToggleInstructions = () => {
        const { display } = appStore.getComputedState();
        appStore.dispatch.setDisplay(
            display === "instructions" ? "normal" : "instructions"
        );
    };

    return (
        <Div marginRight={`${SP[2]}px`}>
            <IconButton
                onClick={onToggleInstructions}
                iconHeight={22}
                iconWidth={22}
                isCircular={true}
                selected={display === "instructions"}
                activeColor={backgroundColor}
            >
                {icons.help}
            </IconButton>
        </Div>
    );
};
