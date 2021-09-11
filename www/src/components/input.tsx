import React, { useRef, useEffect, useState, useCallback } from "react";
import { CSSTransition } from "react-transition-group";
import styled from "styled-components";
import { ChordSymbol } from "./symbol";
import {
    Store,
    StateType,
    ActionTypes,
    useStore,
    useCurrentProgression,
    useCurrentFretboard,
    getFretboard,
    ProgressionStateType,
} from "../store";
import { ChordTypes, NoteTypes } from "../types";
import {
    FLAT_NAMES,
    SHARP_NAMES,
    CHORD_NAMES,
    SHAPES,
    mod,
    FretboardUtil,
    cascadeDiffs,
    SLIDER_RIGHT_WINDOW,
    SLIDER_WINDOW_LENGTH,
    DEFAULT_STRINGSWITCH,
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

const Tag = styled.div.attrs((props: CSSProps) => {
    return {
        style: {
            border: props.highlighted
                ? "2px solid #000"
                : "2px solid transparent",
        },
    };
})<CSSProps>`
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
        event.preventDefault();
        event.stopPropagation();

        if (!activeRef.current) setActive(true);
    };

    const onMouseUp = useCallback((event: MouseEvent | TouchEvent) => {
        event.preventDefault();
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
    store: Store<StateType, ActionTypes>;
}

export const ChordInput: React.FC<Props> = ({ store }) => {
    const [getState] = useStore(store, [
        "showInput",
        "currentProgressionIndex",
    ]);
    const [getCurrentProgression] = useCurrentProgression(store, [
        "label",
        "focusedIndex",
    ]);
    const [getCurrentFretboard] = useCurrentFretboard(store, [
        "rootIdx",
        "rootName",
        "chordName",
        "chordNotes",
    ]);
    const { showInput } = getState();
    const { label } = getCurrentProgression();
    const { rootIdx, chordName } = getCurrentFretboard();

    const noteNames: NoteTypes[] = label === "sharp" ? SHARP_NAMES : FLAT_NAMES;
    const animationRef = useRef<ReturnType<typeof requestAnimationFrame>>();

    const getNotes = (rootIdx: number, chordName: ChordTypes) => {
        if (!chordName) chordName = "maj";
        let notes = SHAPES[chordName].map((i) => mod(i + rootIdx, 12));
        notes.sort();
        return notes;
    };

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

        const { progressions, currentProgressionIndex } = getState();
        const { focusedIndex, label, fretboards } = getCurrentProgression();
        let frameCount = 0;
        let animationDuration = 0.25; // 0.25 seconds roughly comes out to 15 frames
        let totalFrames = Math.ceil(animationDuration * 60);
        let nextProgress = focusedIndex + SLIDER_RIGHT_WINDOW;

        // create new fretboard from notes, set name accordingly
        let newFretboard = new FretboardUtil();
        for (let i = 0; i < notes.length; i++) {
            newFretboard.set(notes[i], true);
        }
        newFretboard.setName(label);

        // add new fretboard to the right of current
        fretboards.splice(focusedIndex + 1, 0, newFretboard);

        // set current fretboard to hidden for slider
        fretboards[focusedIndex].visible = false;
        fretboards[focusedIndex].strings = DEFAULT_STRINGSWITCH();
        progressions[currentProgressionIndex] = {
            ...getCurrentProgression(),
            ...cascadeDiffs(fretboards, focusedIndex),
            progress: nextProgress,
        };

        // update diffs
        store.setPartialState({
            progressions,
        });

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

            store.setNestedListKey<
                ProgressionStateType,
                keyof ProgressionStateType
            >(
                "progressions",
                currentProgressionIndex,
                "progress",
                nextProgress
            );
            if (nextProgress > focusedIndex + 1)
                store.setNestedListKey<
                    ProgressionStateType,
                    keyof ProgressionStateType
                >(
                    "progressions",
                    currentProgressionIndex,
                    "focusedIndex",
                    focusedIndex + 1
                );

            if (frameCount === totalFrames) {
                // clear interval
                cancelAnimationFrame(animationRef.current);

                // remove old fretboard, update diffs, reset progress and focusedIndex
                fretboards.splice(focusedIndex, 1);
                progressions[currentProgressionIndex] = {
                    ...getCurrentProgression(),
                    ...cascadeDiffs(fretboards, focusedIndex),
                    progress: focusedIndex + 0.5,
                    focusedIndex: focusedIndex,
                };
                store.setPartialState({
                    progressions,
                });
            }
        };
        requestAnimationFrame(performAnimation);
    };

    const onRootChange =
        (newRootIdx: number) => (event: MouseEvent | TouchEvent) => {
            event.preventDefault();
            event.stopPropagation();
            const fretboard = getFretboard(getState());
            const rootIdx = fretboard.rootIdx;
            const chordName = fretboard.chordName;
            if (newRootIdx === rootIdx) return;
            fretboardAnimation(getNotes(newRootIdx, chordName));
        };

    const onChordChange =
        (newChordName: ChordTypes) => (event: MouseEvent | TouchEvent) => {
            event.preventDefault();
            event.stopPropagation();
            const fretboard = getFretboard(getState());
            const rootIdx = fretboard.rootIdx;
            const chordName = fretboard.chordName;
            if (newChordName === chordName) return;
            fretboardAnimation(getNotes(rootIdx, newChordName));
        };

    const onClick = () => {
        store.dispatch({
            type: "SET_SHOW_INPUT",
            payload: { showInput: false },
        });
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
