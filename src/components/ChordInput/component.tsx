import React, { useRef, useEffect, useState, useCallback } from "react";
import { ChordSymbol } from "../ChordSymbol";
import { Div, FlexRow } from "../Common";
import {
    useStateRef,
    AppStore,
    getComputedAppState,
    AudioStore,
} from "../../store";
import {
    ChordTypes,
    FretboardNameType,
    LabelTypes,
    NoteTypes,
    ReactMouseEvent,
} from "../../types";
import {
    FLAT_NAMES,
    SHARP_NAMES,
    CHORD_NAMES,
    majorChord,
    SP,
    getFretboardDimensions,
    DEFAULT_FRETBOARD_NAME,
    FRETBOARD_MARGIN,
} from "../../utils";
import { ChordInputContainer, OverflowContainerDiv, Tag, Label } from "./style";

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

    // const preventDefault = (
    // event: ReactMouseEvent
    // ) => {
    //     event.preventDefault();
    //     event.stopPropagation();
    // };

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
        };

    const { maxInputHeight } = getFretboardDimensions();

    return (
        <ChordInputContainer
            height={`${maxInputHeight - FRETBOARD_MARGIN}px`}
            marginBottom={`${FRETBOARD_MARGIN}px`}
        >
            <FlexRow width="100%" height="100%">
                <Label
                    marginLeft={`${SP[2]}px`}
                    width={`calc(15% - ${SP[2]}px)`}
                    flexShrink={0}
                >
                    Root:
                </Label>
                <FlexRow
                    marginLeft={`${SP[2]}px`}
                    marginRight={`${SP[2]}px`}
                    width={`calc(85% - ${2 * SP[2]}px)`}
                    height="100%"
                >
                    {noteNames.map((name, j) => (
                        <FlexRow
                            key={`${name}-key-${j}`}
                            height="100%"
                            onMouseDown={onRootChange(j)}
                            onTouchStart={onRootChange(j)}
                        >
                            <Tag highlighted={rootIdx === j}>
                                <ChordSymbol
                                    rootName={name}
                                    chordName=""
                                    fontSize={12}
                                />
                            </Tag>
                        </FlexRow>
                    ))}
                </FlexRow>
            </FlexRow>
            <FlexRow width="100%" height="100%">
                <Label
                    marginLeft={`${SP[2]}px`}
                    width={`calc(15% - ${SP[2]}px)`}
                >
                    Chord/Scale:
                </Label>
                <OverflowContainerDiv
                    marginLeft={`${SP[2]}px`}
                    marginRight={`${SP[2]}px`}
                    width={`calc(85% - ${2 * SP[2]}px)`}
                    height="100%"
                    className="overflow-container"
                >
                    <Div>
                        <FlexRow
                            paddingLeft="66%"
                            paddingRight="66%"
                            width="100%"
                            height="100%"
                        >
                            {CHORD_NAMES.map((name, j) => (
                                <Tag
                                    key={`${name}-key-${j}`}
                                    onMouseDown={onChordChange(name)}
                                    onTouchStart={onChordChange(name)}
                                    highlighted={chordName === name}
                                    wide={true}
                                >
                                    <ChordSymbol
                                        rootName=""
                                        chordName={name}
                                        fontSize={12}
                                    />
                                </Tag>
                            ))}
                        </FlexRow>
                    </Div>
                </OverflowContainerDiv>
            </FlexRow>
        </ChordInputContainer>
    );
};
