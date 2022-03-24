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
    FretboardNameType,
    LabelTypes,
    NoteTypes,
    ReactMouseEvent,
    WindowMouseEvent,
} from "../../types";
import {
    FLAT_NAMES,
    SHARP_NAMES,
    CHORD_NAMES,
    majorChord,
    SP,
    DEFAULT_FRETBOARD_NAME,
} from "../../utils";
import {
    ChordInputContainer,
    ChordScaleContainer,
    ChordScaleTag,
    OverflowContainerDiv,
    RootContainer,
    RootTag,
    ShadowOverlay,
} from "./style";

interface ChordNameProps {
    highlighted: boolean;
    chordName?: ChordTypes;
    rootName?: NoteTypes;
    onClick: (event: ReactMouseEvent | WindowMouseEvent) => void;
}

const ChordRoot: React.FC<ChordNameProps> = ({
    highlighted,
    rootName,
    onClick,
}) => {
    const touchHandlers = useTouchHandlers({
        onEnd: (event) => {
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

const ChordName: React.FC<ChordNameProps> = ({
    highlighted,
    chordName,
    onClick,
}) => {
    const touchHandlers = useTouchHandlers({
        onEnd: (event) => {
            onClick && onClick(event);
        },
    });

    return (
        <FlexRow height="100%" width="100%" {...touchHandlers}>
            <ChordScaleTag
                highlighted={highlighted}
                wide={true}
                size={`calc(100% - ${SP[3]}px)`}
            >
                <ChordSymbol
                    rootName=""
                    chordName={chordName || ""}
                    fontSize={12}
                />
            </ChordScaleTag>
        </FlexRow>
    );
};

interface ChordInputProps {
    appStore: AppStore;
    audioStore: AudioStore;
}

interface ChordInputState {
    label: LabelTypes;
    name: FretboardNameType;
}

export const ChordInput: React.FC<ChordInputProps> = ({
    appStore,
    audioStore,
}) => {
    // state
    const { visibleFretboards, currentVisibleFretboardIndex, progression } =
        appStore.getComputedState();
    const fretboard = visibleFretboards[currentVisibleFretboardIndex];
    const [getState, setState] = useStateRef<ChordInputState>(() => ({
        label: progression.label,
        name: fretboard
            ? fretboard.names.filter((name) => name.isSelected)[0]
            : DEFAULT_FRETBOARD_NAME(),
    }));
    const { label, name } = getState();
    const { rootIdx, chordName } = name;
    const noteNames: NoteTypes[] = label === "sharp" ? SHARP_NAMES : FLAT_NAMES;

    useEffect(() => {
        // if (getState().name.foundChordName) {
        //     const chordTag = document.getElementById(
        //         `chordName-${getState().name.foundChordName}`
        //     );
        //     if (chordTag)
        //         chordTag.scrollIntoView({
        //             inline: "center",
        //             behavior: "smooth",
        //         });
        // }

        return appStore.addListener((newState) => {
            const {
                progression,
                visibleFretboards,
                currentVisibleFretboardIndex,
            } = getComputedAppState(newState);
            const fretboard = visibleFretboards[currentVisibleFretboardIndex];
            const { label } = progression;
            const name = fretboard
                ? fretboard.names.filter((name) => name.isSelected)[0]
                : DEFAULT_FRETBOARD_NAME();

            if (getState().label !== label || getState().name !== name) {
                setState({
                    label,
                    name,
                });
            }
        });
    }, []);

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
                const { fretboard } = appStore.getComputedState();
                audioStore.strumChord(fretboard);
            }
        );
    };

    const onChordChange =
        (newChordName: ChordTypes) => (event: ReactMouseEvent) => {
            const { name } = getState();
            const { rootIdx, foundChordName } = name;
            if (newChordName === foundChordName) return;
            // default rootIdx to "C" if not set
            appStore.chordInputAnimation(
                Math.max(rootIdx, 0),
                newChordName,
                () => {
                    // strum fretboard
                    const { fretboard } = appStore.getComputedState();
                    audioStore.strumChord(fretboard);
                }
            );
            // scroll the current element into view
            // event.currentTarget.scrollIntoView({
            //     inline: "center",
            //     behavior: "smooth",
            // });
        };

    // const { maxInputHeight } = getFretboardDimensions();

    return (
        <ChordInputContainer>
            <Div className="label-container">
                <Div>Root</Div>
                <Div>Chord/Scale</Div>
            </Div>
            <Div className="chord-scale-container">
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
                <ChordScaleContainer>
                    <ShadowOverlay className="overflow-container" />
                    <OverflowContainerDiv className="overflow-container">
                        <FlexRow width="fit-content" height="100%">
                            {CHORD_NAMES.map((name, j) => (
                                <ChordName
                                    key={`${name}-key-${j}`}
                                    highlighted={chordName === name}
                                    chordName={name}
                                    onClick={onChordChange(name)}
                                />
                            ))}
                        </FlexRow>
                    </OverflowContainerDiv>
                </ChordScaleContainer>
            </Div>
        </ChordInputContainer>
    );
};
