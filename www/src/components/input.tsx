import React, { useRef, useEffect, useState, useCallback } from "react";
import { CSSTransition } from "react-transition-group";
import styled from "styled-components";
import { ChordSymbol } from "./symbol";
import {
    Store,
    useStateRef,
    StateType,
    SliderStateType,
    AnyReducersType,
    current,
} from "../store";
import { ChordTypes, NoteTypes } from "../types";
import {
    FLAT_NAMES,
    SHARP_NAMES,
    CHORD_NAMES,
    cascadeDiffs,
    SLIDER_RIGHT_WINDOW,
    SLIDER_WINDOW_LENGTH,
    DEFAULT_STRINGSWITCH,
    getName,
    getNotes,
    getNotesForAnimation,
    SELECTED,
    setFret,
    clearHighlight,
    STANDARD_TUNING,
    majorChord,
} from "../utils";

// CSS
interface CSSProps {
    width?: number;
    backgroundColor?: string;
    activeColor?: string;
    highlighted?: boolean;
    active?: boolean;
    border?: string;
}

const ChordInputContainer = styled.div<CSSProps>`
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    width: 100%;
`;

const FlexRow = styled.div<CSSProps>`
    display: flex;
    align-items: start;
    justify-content: flex-start;
`;

const Title = styled.div<CSSProps>`
    font-size: 14px;
`;

const Tag = styled.div.attrs((props: CSSProps) => ({
    style: {
        border: props.highlighted ? "2px solid #000" : "2px solid transparent",
    },
}))<CSSProps>`
    margin: 4px 8px 4px 0;
    border-radius: 4px;
    min-width: 26px;
    min-height: 14px;
    font-size: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
`;

interface TagButtonProps {
    activeColor?: string;
    backgroundColor?: string;
    highlighted?: boolean;
    imageSrc?: string;
    border?: string;
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
    store: Store<StateType, AnyReducersType<StateType>>;
    sliderStore: Store<SliderStateType, AnyReducersType<SliderStateType>>;
}

export const ChordInput: React.FC<Props> = ({ store, sliderStore }) => {
    // state
    const { fretboard, progression } = current(store.state);
    const [getState, setState] = useStateRef({
        label: progression.label,
        name: getName(getNotes(fretboard), progression.label),
        showInput: store.state.showInput,
    });
    const { label, name, showInput } = getState();
    const { rootIdx, chordName } = name;
    const noteNames: NoteTypes[] = label === "sharp" ? SHARP_NAMES : FLAT_NAMES;

    // refs
    const animationRef = useRef<ReturnType<typeof requestAnimationFrame>>();

    useEffect(() => {
        return store.addListener((newState) => {
            const { showInput } = newState;
            const { fretboard, progression } = current(newState);
            const name = getName(getNotes(fretboard), progression.label);

            if (
                getState().name !== name ||
                getState().showInput !== showInput
            ) {
                setState((prevState) => ({
                    ...prevState,
                    name,
                    showInput,
                }));
            }
        });
    }, []);

    const preventDefault = (
        event:
            | React.MouseEvent<HTMLDivElement, MouseEvent>
            | React.TouchEvent<HTMLDivElement>
    ) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const fretboardAnimation = (notes: number[]) => {
        // cancel past animation if pressed quickly
        if (animationRef.current) cancelAnimationFrame(animationRef.current);

        const { progression } = current(store.state);
        const { focusedIndex, fretboards } = progression;
        let nextProgress = focusedIndex + SLIDER_RIGHT_WINDOW;

        let frameCount = 0;
        let animationDuration = 0.25; // 0.25 seconds roughly comes out to 15 frames
        let totalFrames = Math.ceil(animationDuration * 60);

        // create new fretboard from notes, set all on E string arbitrarily
        let newFretboard = DEFAULT_STRINGSWITCH();
        for (let i = 0; i < notes.length; i++) {
            let fretValue = notes[i];
            while (fretValue < STANDARD_TUNING[0]) fretValue += 12;
            setFret(newFretboard, 0, fretValue, SELECTED);
        }

        // add new fretboard to the right of current
        fretboards.splice(focusedIndex + 1, 0, newFretboard);

        // set current fretboard to hidden for slider
        const hiddenFretboardIndices = [focusedIndex];
        clearHighlight(fretboards[focusedIndex]);

        // update diffs
        store.dispatch.setCurrentProgression({
            ...progression,
            ...cascadeDiffs(fretboards, focusedIndex),
            hiddenFretboardIndices,
        });
        sliderStore.dispatch.setProgress(nextProgress);

        const performAnimation = () => {
            animationRef.current = requestAnimationFrame(performAnimation);

            // increment progress and focused index on each frame
            frameCount++;

            // linear animation
            nextProgress += SLIDER_WINDOW_LENGTH / totalFrames;

            // sinusoidal animation
            // nextProgress +=
            //     2 *
            //     (SLIDER_WINDOW_LENGTH / totalFrames) *
            //     Math.sin((Math.PI * frameCount) / totalFrames) ** 2;

            // set progress, and check if we should update focusedIndex
            sliderStore.dispatch.setProgress(nextProgress);
            if (nextProgress > focusedIndex + 1)
                store.dispatch.setFocusedIndex(focusedIndex + 1);
            // when done animating, remove extra fretboard and reset progress
            if (frameCount === totalFrames) {
                // clear interval
                cancelAnimationFrame(animationRef.current);

                // remove old fretboard, update diffs, reset progress and focusedIndex
                fretboards.splice(focusedIndex, 1);
                store.dispatch.setCurrentProgression({
                    ...progression,
                    ...cascadeDiffs(fretboards, focusedIndex),
                    hiddenFretboardIndices: [],
                    focusedIndex: focusedIndex,
                });
                sliderStore.dispatch.setProgress(focusedIndex + 0.5);
            }
        };
        requestAnimationFrame(performAnimation);
    };

    const onRootChange =
        (newRootIdx: number) => (event: MouseEvent | TouchEvent) => {
            event.preventDefault();
            event.stopPropagation();
            const { name } = getState();
            const { rootIdx, foundChordName } = name;
            if (newRootIdx === rootIdx) return;
            // default chordName to "maj" if not set
            fretboardAnimation(
                getNotesForAnimation(newRootIdx, foundChordName || majorChord)
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
            fretboardAnimation(
                getNotesForAnimation(Math.max(rootIdx, 0), newChordName)
            );
        };

    const onClick = () => {
        store.dispatch.setShowInput(false);
    };

    return (
        <ChordInputContainer onClick={onClick} onTouchStart={onClick}>
            {showInput && (
                <CSSTransition
                    in={showInput}
                    timeout={300}
                    classNames="input-fade"
                    // onEnter={() => setShowButton(false)}
                    // onExited={() => setShowButton(true)}
                >
                    <>
                        <div
                            onClick={preventDefault}
                            onTouchStart={preventDefault}
                        >
                            {/* <Title>Root</Title> */}
                            <FlexRow>
                                {noteNames.slice(0, 6).map((name, j) => (
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
                            <FlexRow>
                                {noteNames.slice(6).map((name, j) => (
                                    <TagButton
                                        key={`${name}-key`}
                                        onClick={onRootChange(j + 6)}
                                        highlighted={rootIdx === j + 6}
                                    >
                                        <ChordSymbol
                                            rootName={name}
                                            chordName=""
                                            fontSize={12}
                                        />
                                    </TagButton>
                                ))}
                            </FlexRow>
                        </div>
                        <div
                            onClick={preventDefault}
                            onTouchStart={preventDefault}
                        >
                            {/* <Title>Chord/Scale</Title> */}
                            <FlexRow>
                                {CHORD_NAMES.slice(0, 11).map((name) => (
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
                            <FlexRow>
                                {CHORD_NAMES.slice(11).map((name) => (
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
                        </div>
                    </>
                </CSSTransition>
            )}
        </ChordInputContainer>
    );
};
