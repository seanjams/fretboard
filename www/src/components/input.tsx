import React, { useRef, useEffect, useState, useCallback } from "react";
import { CSSTransition } from "react-transition-group";
import styled from "styled-components";
import { ChordSymbol } from "./symbol";
import { Store, StateType, ActionTypes, usePartialStore } from "../store";
import { ChordTypes, NoteSwitchType } from "../types";
import {
    FLAT_NAMES,
    SHARP_NAMES,
    CHORD_NAMES,
    SHAPES,
    mod,
    FretboardUtil,
    cascadeDiffs,
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
            border:
                props.active || props.highlighted
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

        if (activeRef.current) {
            setActive(false);
            if (onClick) onClick(event);
        }
    }, []);

    return (
        <Tag
            onTouchStart={onMouseDown}
            onMouseDown={onMouseDown}
            active={active}
            highlighted={highlighted}
        >
            {children}
        </Tag>
    );
};

interface Props {
    store: Store<StateType, ActionTypes>;
}

export const ChordInput: React.FC<Props> = ({ store }) => {
    const [getState] = usePartialStore(store, [
        "fretboards",
        "focusedIndex",
        "label",
        "showInput",
    ]);
    const { fretboards, focusedIndex, label, showInput } = getState();
    const animationRef = useRef<ReturnType<typeof requestAnimationFrame>>();
    const fretboard = fretboards[focusedIndex];
    const rootIdx = fretboard.rootIdx;
    const chordName = fretboard.chordName;

    const noteNames: string[] = label === "sharp" ? SHARP_NAMES : FLAT_NAMES;

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
        const { fretboards, focusedIndex, label } = getState();
        let total = 0;
        let n = 15;
        let nextProgress = focusedIndex + 0.75;

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

        // update diffs
        store.setPartialState({
            ...cascadeDiffs(fretboards, focusedIndex),
            progress: nextProgress,
        });

        const performAnimation = () => {
            animationRef.current = requestAnimationFrame(performAnimation);

            // increment progress and focused index on each frame
            nextProgress += 0.5 / n;
            store.setKey("progress", nextProgress);
            if (nextProgress > focusedIndex + 1)
                store.setKey("focusedIndex", focusedIndex + 1);

            total++;
            if (total === n) {
                // clear interval
                cancelAnimationFrame(animationRef.current);

                // reset progress and focused index on last frame
                store.setKey("progress", focusedIndex + 0.5);
                store.setKey("focusedIndex", focusedIndex);

                // remove old fretboard, and update diffs
                fretboards.splice(focusedIndex, 1);
                store.setPartialState({
                    ...cascadeDiffs(fretboards, focusedIndex),
                });
            }
        };
        requestAnimationFrame(performAnimation);
    };

    const onRootChange =
        (newRootIdx: number) => (event: MouseEvent | TouchEvent) => {
            event.preventDefault();
            event.stopPropagation();
            const { fretboards, focusedIndex } = getState();
            const fretboard = fretboards[focusedIndex];
            const rootIdx = fretboard.rootIdx;
            const chordName = fretboard.chordName;
            if (newRootIdx === rootIdx) return;
            fretboardAnimation(getNotes(newRootIdx, chordName));
        };

    const onChordChange =
        (newChordName: ChordTypes) => (event: MouseEvent | TouchEvent) => {
            event.preventDefault();
            event.stopPropagation();
            const { fretboards, focusedIndex } = getState();
            const fretboard = fretboards[focusedIndex];
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
                                            value={name}
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
                                            value={name}
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
                                            value={name}
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
                                            value={name}
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
