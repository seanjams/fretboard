import React, { useRef, useEffect, useState, useCallback } from "react";
import { ChordSymbol } from "../ChordSymbol";
import { Div, FlexRow } from "../Common";
import {
    useStateRef,
    AppStore,
    getComputedAppState,
    AudioStore,
} from "../../store";
import { ChordTypes, NoteTypes } from "../../types";
import {
    FLAT_NAMES,
    SHARP_NAMES,
    CHORD_NAMES,
    getName,
    getNotesByChordName,
    majorChord,
    SP,
    getFretboardDimensions,
} from "../../utils";
import { ChordInputContainer, OverflowContainerDiv, Tag, Title } from "./style";

interface TagButtonProps {
    highlighted?: boolean;
    onClick?: (event: MouseEvent | TouchEvent) => void;
}

export const TagButton: React.FC<TagButtonProps> = ({
    onClick,
    highlighted,
    children,
}) => {
    const [active, setActive] = useState(highlighted);
    const activeRef = useRef(active);
    activeRef.current = active;

    useEffect(() => {
        window.addEventListener("mouseup", onMouseUp);
        window.addEventListener("touchend", onMouseUp);
        return () => {
            window.removeEventListener("mouseup", onMouseUp);
            window.removeEventListener("touchend", onMouseUp);
        };
    }, []);

    useEffect(() => {
        if (!highlighted) setActive(false);
    }, [highlighted]);

    const onMouseDown = (
        event:
            | React.MouseEvent<HTMLDivElement, MouseEvent>
            | React.TouchEvent<HTMLDivElement>
    ) => {
        event.stopPropagation();

        if (!activeRef.current) setActive(true);
    };

    const onMouseUp = useCallback((event: MouseEvent | TouchEvent) => {
        event.stopPropagation();

        if (activeRef.current && onClick) onClick(event);
    }, []);

    return (
        <Tag
            onTouchStart={onMouseDown}
            onMouseDown={onMouseDown}
            highlighted={highlighted || active}
        >
            {children}
        </Tag>
    );
};

interface Props {
    appStore: AppStore;
    audioStore: AudioStore;
}

export const ChordInput: React.FC<Props> = ({ appStore, audioStore }) => {
    // state
    const { fretboard, progression } = appStore.getComputedState();
    const [getState, setState] = useStateRef(() => ({
        label: progression.label,
        name: getName(fretboard, progression.label)[0],
    }));
    const { label, name } = getState();
    const { rootIdx, chordName } = name;
    const noteNames: NoteTypes[] = label === "sharp" ? SHARP_NAMES : FLAT_NAMES;

    // refs
    const animationRef = useRef<ReturnType<typeof requestAnimationFrame>>();

    useEffect(() => {
        return appStore.addListener((newState) => {
            const { fretboard, progression } = getComputedAppState(newState);
            const name = getName(fretboard, progression.label)[0];

            if (getState().name !== name) {
                setState({
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
        (newRootIdx: number) => (event: MouseEvent | TouchEvent) => {
            event.preventDefault();
            event.stopPropagation();
            const { name } = getState();
            const { rootIdx, foundChordName } = name;
            if (newRootIdx === rootIdx) return;
            // default chordName to "maj" if not set
            appStore.chordInputAnimation(
                getNotesByChordName(newRootIdx, foundChordName || majorChord),
                () => {
                    // // strum fretboard
                    // const { fretboard } = this.getComputedState();
                    // audioStore.strumChord(fretboard);
                }
            );
        };

    const onChordChange =
        (newChordName: ChordTypes) => (event: MouseEvent | TouchEvent) => {
            event.preventDefault();
            event.stopPropagation();

            const { name } = getState();
            const { rootIdx, foundChordName } = name;
            if (newChordName === foundChordName) return;
            // default rootIdx to "C" if not set
            appStore.chordInputAnimation(
                getNotesByChordName(Math.max(rootIdx, 0), newChordName),
                () => {
                    // // strum fretboard
                    // const { fretboard } = this.getComputedState();
                    // audioStore.strumChord(fretboard);
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
                        <TagButton
                            key={`${name}-key`}
                            onClick={onRootChange(j)}
                            highlighted={rootIdx === j}
                        >
                            <ChordSymbol
                                rootName={name}
                                chordName=""
                                fontSize={12}
                            />
                        </TagButton>
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
                    <Div>
                        <FlexRow
                            paddingLeft={`calc(30% + ${SP[3]}px)`}
                            paddingRight={`calc(30% + ${SP[3]}px)`}
                        >
                            {CHORD_NAMES.map((name) => (
                                <TagButton
                                    key={`${name}-key`}
                                    onClick={onChordChange(name)}
                                    highlighted={chordName === name}
                                >
                                    <ChordSymbol
                                        rootName=""
                                        chordName={name}
                                        fontSize={12}
                                    />
                                </TagButton>
                            ))}
                        </FlexRow>
                    </Div>
                </OverflowContainerDiv>
            </FlexRow>
        </ChordInputContainer>
    );
};
