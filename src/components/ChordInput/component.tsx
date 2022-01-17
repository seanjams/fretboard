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
} from "../../types";
import {
    FLAT_NAMES,
    SHARP_NAMES,
    CHORD_NAMES,
    getFretboardName,
    majorChord,
    SP,
    getFretboardDimensions,
    defaultFretboardName,
} from "../../utils";
import { ChordInputContainer, OverflowContainerDiv, Tag, Title } from "./style";

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
            ? getFretboardName(fretboard, progression.label)[0]
            : defaultFretboardName,
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
                ? getFretboardName(fretboard, label)[0]
                : defaultFretboardName;

            if (getState().label !== label || getState().name !== name) {
                setState({
                    label,
                    name,
                });
            }
        });
    }, []);

    // const preventDefault = (
    //     event:
    //         | React.MouseEvent<HTMLDivElement, MouseEvent>
    //         | React.TouchEvent<HTMLDivElement>
    // ) => {
    //     event.preventDefault();
    //     event.stopPropagation();
    // };

    const onRootChange =
        (newRootIdx: number) =>
        (
            event:
                | React.MouseEvent<HTMLDivElement, MouseEvent>
                | React.TouchEvent<HTMLDivElement>
        ) => {
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
        (newChordName: ChordTypes) =>
        (
            event:
                | React.MouseEvent<HTMLDivElement, MouseEvent>
                | React.TouchEvent<HTMLDivElement>
        ) => {
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

    const onClick = (
        event:
            | React.MouseEvent<HTMLDivElement, MouseEvent>
            | React.TouchEvent<HTMLDivElement>
    ) => {
        // event.preventDefault();
        // event.stopPropagation();
        // if (appStore.state.showTopDrawer) appStore.dispatch.setShowTopDrawer(false);
    };

    const { maxInputHeight, minInputHeight } = getFretboardDimensions();

    return (
        <ChordInputContainer
            onClick={onClick}
            onTouchStart={onClick}
            height={`${maxInputHeight}px`}
        >
            <FlexRow
                // onClick={preventDefault}
                // onTouchStart={preventDefault}
                width="100%"
            >
                <Title
                    marginLeft={`${SP[2]}px`}
                    width={`calc(15% - ${SP[2]}px)`}
                    flexShrink={0}
                    textAlign="right"
                    fontWeight="bold"
                    // marginTop={`${SP[2]}px`}
                >
                    Root:
                </Title>
                <FlexRow
                    marginLeft={`${SP[2]}px`}
                    marginRight={`${SP[2]}px`}
                    width={`calc(85% - ${2 * SP[2]}px)`}
                >
                    {noteNames.map((name, j) => (
                        <Tag
                            key={`${name}-key-${j}`}
                            onClick={onRootChange(j)}
                            onTouchStart={onRootChange(j)}
                            highlighted={rootIdx === j}
                        >
                            <ChordSymbol
                                rootName={name}
                                chordName=""
                                fontSize={12}
                            />
                        </Tag>
                    ))}
                </FlexRow>
            </FlexRow>
            <FlexRow
                // onClick={preventDefault}
                // onTouchStart={preventDefault}
                width="100%"
            >
                <Title
                    marginLeft={`${SP[2]}px`}
                    width={`calc(15% - ${SP[2]}px)`}
                    textAlign="right"
                    fontWeight="bold"
                    // marginTop={`${SP[2]}px`}
                >
                    Chord/Scale:
                </Title>
                <OverflowContainerDiv
                    marginLeft={`${SP[2]}px`}
                    marginRight={`${SP[2]}px`}
                    width={`calc(85% - ${2 * SP[2]}px)`}
                >
                    <FlexRow
                        paddingLeft={`calc(26% + ${3 * SP[7]}px)`}
                        paddingRight={`calc(26% + ${3 * SP[7]}px)`}
                        width="100%"
                    >
                        {CHORD_NAMES.map((name, j) => (
                            <Tag
                                key={`${name}-key-${j}`}
                                onClick={onChordChange(name)}
                                onTouchStart={onChordChange(name)}
                                highlighted={chordName === name}
                            >
                                <ChordSymbol
                                    rootName=""
                                    chordName={name}
                                    fontSize={12}
                                />
                            </Tag>
                        ))}
                    </FlexRow>
                </OverflowContainerDiv>
            </FlexRow>
        </ChordInputContainer>
    );
};
