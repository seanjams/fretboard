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
    lighterGrey,
    mediumGrey,
    white,
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

// Arrow controls that move around highlighted position
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

// (Deprecated) Slider that dictates the select/highlight mode with erase button
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
        const { status, fretboard } = appStore.getComputedState();
        // only clear when in SELECT mode or there is no fret highlighted
        let clearAll =
            status !== HIGHLIGHTED ||
            fretboard.strings.every((fretString, stringIndex) =>
                fretString.every((fretStatus) => fretStatus !== HIGHLIGHTED)
            );

        if (clearAll) {
            appStore.dispatch.clear();
        } else {
            appStore.dispatch.clearHighlight();
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

// Clear Button for highlighted/selected notes
export const ClearControls: React.FC<ControlsProps> = ({ appStore }) => {
    const [getState, setState] = useDerivedState(
        appStore,
        deriveStateFromAppState
    );
    const { backgroundColor, isHighlighted } = getState();
    const isHighlightedRef = useRef(isHighlighted);
    isHighlightedRef.current = isHighlighted;

    function deriveStateFromAppState(appState: typeof appStore.state) {
        const { currentVisibleFretboardIndex, fretboard } =
            getComputedAppState(appState);
        const isHighlighted = fretboard.strings.some((fretString) =>
            fretString.some((fret) => fret === HIGHLIGHTED)
        );
        return {
            isHighlighted,
            backgroundColor: COLORS[currentVisibleFretboardIndex][1],
        };
    }

    const onClear = () => {
        // only clear when in SELECT mode or there is no fret highlighted
        if (isHighlightedRef.current) {
            appStore.dispatch.clearHighlight();
        } else {
            appStore.dispatch.clear();
        }
    };

    return (
        <Div className="pill-button-container clear-button">
            <IconButton
                onClick={onClear}
                iconHeight={18}
                iconWidth={18}
                isCircular={true}
                iconColor={isHighlighted ? white : mediumGrey}
                backgroundColor={isHighlighted ? backgroundColor : lighterGrey}
                activeColor={isHighlighted ? backgroundColor : mediumGrey}
            >
                {icons.bin}
            </IconButton>
            <PillButtonLabel>Clear</PillButtonLabel>
        </Div>
    );
};

// Controls that open the bottom drawer - Help / Settings / Chord / Load
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
        const { display } = appStore.state;
        appStore.dispatch.setDisplay(
            display === newDisplay ? "normal" : newDisplay
        );
    };

    return (
        <PillControlsContainer>
            <Div className="pill-button-container">
                <IconButton
                    onClick={onShowDisplay("instructions")}
                    selected={display === "instructions"}
                    activeColor={backgroundColor}
                >
                    {icons.help}
                </IconButton>
                <PillButtonLabel>Help</PillButtonLabel>
            </Div>
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

// Play / Stop buttons for Audio
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

// Checkboxes within the Settings menu in the bottom drawer
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

// Controls for adding / removing progression
export const ProgressionControls: React.FC<ControlsProps> = ({ appStore }) => {
    const [getState, setState] = useDerivedState(
        appStore,
        deriveStateFromAppState
    );
    const { backgroundColor } = getState();

    function deriveStateFromAppState(appState: typeof appStore.state) {
        const { currentVisibleFretboardIndex, progressions } =
            getComputedAppState(appState);
        return {
            backgroundColor: COLORS[currentVisibleFretboardIndex][2],
            progressions,
        };
    }

    const onAddProgression = () => {
        appStore.dispatch.addProgression();
    };

    const onRemoveProgression = () => {
        if (getState().progressions.length <= 1) return;
        appStore.dispatch.removeProgression();
    };

    return (
        <PillControlsContainer>
            <Div className="pill-button-container">
                <IconButton
                    onClick={onAddProgression}
                    activeColor={backgroundColor}
                >
                    {icons.plus}
                </IconButton>
            </Div>
            <Div className="pill-button-container">
                <IconButton
                    onClick={onRemoveProgression}
                    activeColor={backgroundColor}
                >
                    {icons.minus}
                </IconButton>
            </Div>
        </PillControlsContainer>
    );
};
