import React, { useEffect } from "react";
import { icons } from "../../assets/icons/icons";
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
} from "../../utils";
import { Checkbox } from "../Checkbox";
import { Div, FlexRow } from "../Common";
import { IconButton } from "../IconButton";
import {
    PillControlsContainer,
    HighlightCheckboxAnimation,
    HighlightCheckboxContainer,
    Label,
} from "./style";

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
                    iconHeight={18}
                    iconWidth={18}
                >
                    {icons.arrowLeft}
                </IconButton>
            </Div>
            <Div className="pill-button-container">
                <IconButton
                    onClick={onArrowPress("ArrowDown")}
                    iconHeight={18}
                    iconWidth={18}
                >
                    {icons.arrowDown}
                </IconButton>
            </Div>
            <Div className="pill-button-container">
                <IconButton
                    onClick={onArrowPress("ArrowUp")}
                    iconHeight={18}
                    iconWidth={18}
                >
                    {icons.arrowUp}
                </IconButton>
            </Div>
            <Div className="pill-button-container">
                <IconButton
                    onClick={onArrowPress("ArrowRight")}
                    iconHeight={18}
                    iconWidth={18}
                >
                    {icons.arrowRight}
                </IconButton>
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
            <HighlightCheckboxAnimation trigger={status === HIGHLIGHTED}>
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
    return (
        <PillControlsContainer>
            <Div className="pill-button-container">
                <IconButton onClick={appStore.dispatch.addFretboard}>
                    {icons.plus}
                </IconButton>
            </Div>
            <Div className="pill-button-container">
                <IconButton onClick={appStore.dispatch.removeFretboard}>
                    {icons.minus}
                </IconButton>
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

    const onShowDisplay = (newDisplay: DisplayTypes) => () => {
        const { display, status } = appStore.state;
        if (status === HIGHLIGHTED) appStore.dispatch.setStatus(SELECTED);
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
                >
                    {icons.cog}
                </IconButton>
            </Div>
            <Div className="pill-button-container">
                <IconButton
                    onClick={onShowDisplay("change-chord")}
                    selected={display === "change-chord"}
                >
                    {icons.music}
                </IconButton>
            </Div>
            <Div className="pill-button-container">
                <IconButton
                    onClick={onShowDisplay("change-progression")}
                    selected={display === "change-progression"}
                >
                    {icons.database}
                </IconButton>
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
                iconHeight={22}
                iconWidth={22}
                isCircular={true}
            >
                {icons.play}
            </IconButton>
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
    return (
        <PillControlsContainer>
            <Div className="pill-button-container">
                <IconButton onClick={onAddClick}>{icons.plus}</IconButton>
            </Div>
            <Div className="pill-button-container">
                <IconButton onClick={onRemoveClick}>{icons.minus}</IconButton>
            </Div>
        </PillControlsContainer>
    );
};
