import React, { useRef, useEffect, useState, useCallback } from "react";
import { CSSTransition } from "react-transition-group";
import styled from "styled-components";
import { ChordSymbol } from "./symbol";
import { Store, StateType, ActionTypes, useStoreRef } from "../store";
import { ChordTypes } from "../types";
import { FLAT_NAMES, SHARP_NAMES, CHORD_NAMES, SHAPES, mod } from "../utils";

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
    margin: 0 0 10px 0;
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
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
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
    const [active, setActive] = useState(false);
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
    const [getFretboards, setFretboards] = useStoreRef(store, "fretboards");
    const [getFocusedIndex, setFocusedIndex] = useStoreRef(
        store,
        "focusedIndex"
    );
    const [getShowInput, setShowInput] = useStoreRef(store, "showInput");
    const [getLabel, setLabel] = useStoreRef(store, "label");

    const fretboard = getFretboards()[getFocusedIndex()];
    const rootIdx = fretboard.rootIdx;
    const chordName = fretboard.chordName;

    const noteNames: string[] =
        getLabel() === "sharp" ? SHARP_NAMES : FLAT_NAMES;

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

    const onRootChange =
        (newRootIdx: number) => (event: MouseEvent | TouchEvent) => {
            event.preventDefault();
            event.stopPropagation();

            store.dispatch({
                type: "SET_NOTES",
                payload: { notes: getNotes(newRootIdx, chordName) },
            });
        };

    const onChordChange =
        (newChordName: ChordTypes) => (event: MouseEvent | TouchEvent) => {
            event.preventDefault();
            event.stopPropagation();

            store.dispatch({
                type: "SET_NOTES",
                payload: { notes: getNotes(rootIdx, newChordName) },
            });
        };

    const onClick = () => {
        store.dispatch({
            type: "SET_SHOW_INPUT",
            payload: { showInput: false },
        });
    };

    return (
        <ChordInputContainer onClick={onClick} onTouchStart={onClick}>
            {getShowInput() && (
                <CSSTransition
                    in={getShowInput()}
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
                            <Title>Root</Title>
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
                            <Title>Chord/Scale</Title>
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
