import React, { useEffect } from "react";
import { ChordSymbol } from "../ChordSymbol";
import { Div, FlexRow } from "../Common";
import {
    useStateRef,
    AppStore,
    getComputedAppState,
    AudioStore,
    useTouchHandlers,
} from "../../store";
import {
    ChordTypes,
    NoteTypes,
    ReactMouseEvent,
    WindowMouseEvent,
} from "../../types";
import {
    FLAT_NAMES,
    SHARP_NAMES,
    CHORD_NAMES,
    majorChord,
    DEFAULT_FRETBOARD_NAME,
    shouldUpdate,
} from "../../utils";
import {
    ChordInputContainer,
    ChordScaleContainer,
    RootContainer,
    RootTag,
} from "./style";
import { ScrollSelect, ScrollSelectOption } from "../ScrollSelect";

interface ChordRootProps {
    highlighted: boolean;
    chordName?: ChordTypes;
    rootName?: NoteTypes;
    onClick: (event: ReactMouseEvent | WindowMouseEvent) => void;
}

const ChordRoot: React.FC<ChordRootProps> = ({
    highlighted,
    rootName,
    onClick,
}) => {
    const touchHandlers = useTouchHandlers({
        onClick: (event) => {
            onClick && onClick(event);
        },
    });

    return (
        <FlexRow height="100%" width="100%" {...touchHandlers}>
            <RootTag highlighted={highlighted}>
                <ChordSymbol
                    rootName={rootName || ""}
                    chordName=""
                    fontSize={12}
                />
            </RootTag>
        </FlexRow>
    );
};

interface ChordInputProps {
    appStore: AppStore;
    audioStore: AudioStore;
}

export const ChordInput: React.FC<ChordInputProps> = ({
    appStore,
    audioStore,
}) => {
    // state
    const derivedState = deriveStateFromAppState(appStore.state);
    const [getState, setState] = useStateRef(() => derivedState);
    const { label, name } = getState();
    const { rootIdx, chordName } = name;
    const noteNames: NoteTypes[] = label === "sharp" ? SHARP_NAMES : FLAT_NAMES;

    function deriveStateFromAppState(appState: typeof appStore.state) {
        const { progression, visibleFretboards, currentVisibleFretboardIndex } =
            getComputedAppState(appState);
        const fretboard = visibleFretboards[currentVisibleFretboardIndex];
        const { label } = progression;
        const name = fretboard
            ? fretboard.names.filter((name) => name.isSelected)[0]
            : DEFAULT_FRETBOARD_NAME();
        return {
            label,
            name,
        };
    }

    useEffect(
        () =>
            appStore.addListener((appState) => {
                const derivedState = deriveStateFromAppState(appState);
                if (shouldUpdate(getState(), derivedState))
                    setState(derivedState);
            }),
        []
    );

    const onRootChange = (newRootIdx: number) => (event: ReactMouseEvent) => {
        const { name } = getState();
        const { rootIdx, foundChordName } = name;
        if (newRootIdx === rootIdx) return;
        // default chordName to "maj" if not set
        appStore.chordInputAnimation(
            newRootIdx,
            foundChordName || majorChord,
            () => {
                // strum fretboard
                // const { fretboard } = appStore.getComputedState();
                // audioStore.strumChord(fretboard);
            }
        );
    };

    const onChordChange = (event: ReactMouseEvent, index: number) => {
        const { name } = getState();
        const { rootIdx, foundChordName } = name;
        const newChordName = CHORD_NAMES[index];
        if (!newChordName) return;
        if (newChordName === foundChordName) return;
        // default rootIdx to "C" if not set
        appStore.chordInputAnimation(Math.max(rootIdx, 0), newChordName, () => {
            // strum fretboard
            // const { fretboard } = appStore.getComputedState();
            // audioStore.strumChord(fretboard);
        });
    };

    // const { maxInputHeight } = getFretboardDimensions();

    return (
        <ChordInputContainer>
            <Div className="label-container">
                <Div>Root</Div>
                <Div>Chord/Scale</Div>
            </Div>
            <Div className="chord-scale-container">
                {/* This is the staggered root selector in the ChordInput component */}
                <RootContainer>
                    <FlexRow alignItems="start" width="100%" height="50%">
                        {noteNames.slice(0, 6).map((name, j) => (
                            <ChordRoot
                                key={`${name}-key-${j}`}
                                highlighted={rootIdx === j}
                                rootName={name}
                                onClick={onRootChange(j)}
                            />
                        ))}
                    </FlexRow>
                    <FlexRow
                        marginLeft={`calc(100% / 12)`}
                        width="100%"
                        height="50%"
                        alignItems="start"
                    >
                        {noteNames.slice(6).map((name, j) => (
                            <ChordRoot
                                key={`${name}-key-${j + 6}`}
                                highlighted={rootIdx === j + 6}
                                rootName={name}
                                onClick={onRootChange(j + 6)}
                            />
                        ))}
                    </FlexRow>
                </RootContainer>
                {/* This is the scrollable chord selector in the ChordInput component */}
                <ChordScaleContainer>
                    <ScrollSelect onChange={onChordChange} value={chordName}>
                        {CHORD_NAMES.map((name, j) => (
                            <ScrollSelectOption
                                key={`${name}-key-${j}`}
                                value={name}
                            >
                                <ChordSymbol
                                    rootName=""
                                    chordName={name || ""}
                                    fontSize={12}
                                />
                            </ScrollSelectOption>
                        ))}
                    </ScrollSelect>
                </ChordScaleContainer>
            </Div>
        </ChordInputContainer>
    );
};
