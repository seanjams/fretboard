import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useStore, Store, StateType, ActionTypes } from "../store";
import { DiffType } from "../types";
import {
    mod,
    NoteUtil,
    COLORS,
    STANDARD_TUNING,
    FRETBOARD_WIDTH,
    FRETBOARD_HEIGHT,
    STRING_SIZE,
    CIRCLE_SIZE,
} from "../utils";

const getTopMargin = (fretHeight: number, diameter: number) => {
    // As circles resize, this top margin keeps them centered
    return (fretHeight - diameter) / 2;
};

// CSS
interface CSSProps {
    width?: number;
    height?: number;
    border?: string;
    color?: string;
    backgroundColor?: string;
    top?: number;
    left?: number;
    letterSpacing?: number;
}

const FretDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        borderLeft: props.border,
        borderRight: props.border,
        width: `${props.width}%`,
        height: `${props.height}px`,
    },
}))<CSSProps>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    user-select: none; /* standard syntax */
    -webkit-user-select: none; /* webkit (safari, chrome) browsers */
    -moz-user-select: none; /* mozilla browsers */
    -khtml-user-select: none; /* webkit (konqueror) browsers */
    -ms-user-select: none; /* IE10+ */
`;

const CircleDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        color: props.color,
        letterSpacing: props.letterSpacing,
    },
}))<CSSProps>`
    margin-left: -13px;
    margin-right: -13px;
    border: 1px solid #333;
    box-sizing: border-box;
    color: #333;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 26px;
    height: 26px;
    border-radius: 100%;
    background-color: transparent;
    z-index: 9999;
`;

const ShadowDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        left: `${props.left}%`,
        top: `${props.top}px`,
        width: props.width,
        backgroundColor: props.backgroundColor,
    },
}))<CSSProps>`
    margin-left: -13px;
    margin-right: -13px;
    width: 26px;
    height: 26px;
    border-radius: 100%;
    z-index: 9998;
    position: absolute;
`;

const StringSegmentDiv = styled.div.attrs((props: CSSProps) => ({
    style: {
        height: `${props.height}px`,
        backgroundColor: props.backgroundColor,
    },
}))<CSSProps>`
    width: calc(50% - 13px);
    margin: auto 0;
`;

// Component
interface Props {
    value: number;
    stringIndex: number;
    openString?: boolean;
    fretboardHeight: number;
    store: Store<StateType, ActionTypes>;
}

const is = (diff: DiffType, key: number, val: any, negate: boolean = false) =>
    diff && (negate ? diff[key] !== val : diff[key] === val);

const isNot = (diff: DiffType, key: number, val: any) =>
    is(diff, key, val, true);

export const Fret: React.FC<Props> = ({
    value,
    openString,
    stringIndex,
    fretboardHeight,
    store,
}) => {
    const [state, setState] = useStore(store);

    const noteValue = mod(value, 12);
    // const [secondaryColor, primaryColor] = COLORS[mod(fretboardIndex, COLORS.length)];
    const [secondaryColor, primaryColor] = COLORS[0];

    const note = new NoteUtil(value);
    // const color = isHighlighted ? "white" : "#333";
    const color = false ? "white" : "#333";
    const fretIndex = value - STANDARD_TUNING[stringIndex];

    // makes frets progressively smaller
    // what did I even do here. Basically its some line
    // const fretWidth = (1 + (12 - fretIndex) / 30) * 8.333333;

    // temporary until I scale it to no moving target
    const fretWidth = FRETBOARD_WIDTH / STRING_SIZE;
    const fretHeight = fretboardHeight / 6;

    const thickness = (6 - stringIndex + 1) / 2;
    const border = openString ? "none" : "1px solid #333";

    // init refs
    const [label, setLabel] = useState(state.label);
    const fretboard = state.fretboards[state.focusedIndex];
    const isHighlighted = fretboard.getFret(stringIndex, value);
    const isSelected = fretboard.get(value);
    const isSelectedRef = useRef(isSelected);
    const isHighlightedRef = useRef(isHighlighted);
    const shadowRef = useRef<HTMLDivElement>();
    const brushModeRef = useRef(state.brushMode);
    const isDraggingRef = useRef(false);
    const labelRef = useRef(label);
    labelRef.current = label;

    const getBackgroundColor = (
        isSelected: boolean,
        isHighlighted: boolean
    ) => {
        return isHighlighted
            ? primaryColor
            : isSelected
            ? secondaryColor
            : "transparent";
    };

    useEffect(() => {
        store.addListener(
            ({
                progress,
                focusedIndex,
                leftDiffs,
                rightDiffs,
                fretboards,
                invert,
                brushMode,
                isDragging,
                label,
            }) => {
                if (!shadowRef.current) return;

                const i = focusedIndex; // to battle verbosity
                const fretboard = fretboards[i];
                const leftDiff = leftDiffs[i];
                const rightDiff = rightDiffs[i];
                const isSelected = fretboard.get(value);
                const isHighlighted = fretboard.getFret(stringIndex, value);

                if (isSelectedRef.current !== isSelected)
                    isSelectedRef.current = isSelected;
                if (isHighlightedRef.current !== isHighlighted)
                    isHighlightedRef.current = isHighlighted;
                if (brushModeRef.current !== brushMode)
                    brushModeRef.current = brushMode;
                if (isDraggingRef.current !== isDragging)
                    isDraggingRef.current = isDragging;
                if (labelRef.current !== label) setLabel(label);

                let newLeft;
                let fillPercentage;
                let diameter = CIRCLE_SIZE;
                let background = getBackgroundColor(isSelected, isHighlighted);
                let direction = invert ? -1 : 1;

                // this fret has a destination in the fretboard to the left/right
                const leftExists = isNot(leftDiff, noteValue, undefined);
                const rightExists = isNot(rightDiff, noteValue, undefined);

                // this fret is filled now,
                // and does not have a destination in the fretboard to the left/right
                const leftEmpty = isSelected && is(leftDiff, noteValue, -9999);
                const rightEmpty =
                    isSelected && is(rightDiff, noteValue, -9999);

                // this fret is empty now,
                // and has a destination in the fretboard to the left/right
                const leftFill = !isSelected && is(leftDiff, noteValue, 9999);
                const rightFill = !isSelected && is(rightDiff, noteValue, 9999);

                // consts
                const origin = 50;
                const leftWindow = 0.25;
                const rightWindow = 0.75;
                const windowLength = 1 + leftWindow - rightWindow;

                // slider range booleans
                const outsideLeft = leftExists && progress < i;
                const insideLeft =
                    leftExists && i <= progress && progress <= i + leftWindow;
                const middle =
                    i + leftWindow < progress && progress <= i + rightWindow;
                const insideRight =
                    rightExists &&
                    i + rightWindow < progress &&
                    progress < i + 1;
                const outsideRight = rightExists && i + 1 <= progress;

                let x: number;
                let diffSteps: number;

                if (outsideLeft) {
                    // all altered notes should be 50% to the left
                    if (leftEmpty) {
                        fillPercentage = 100;
                    } else if (leftFill) {
                        fillPercentage = 0;
                    } else {
                        newLeft = direction * leftDiff[noteValue] * 50 + origin;
                    }
                } else if (insideLeft) {
                    // all altered notes should be x% to the left
                    x = ((i + leftWindow - progress) * 100) / windowLength;

                    if (leftEmpty) {
                        fillPercentage = 100 - x;
                    } else if (leftFill) {
                        fillPercentage = x;
                        background = secondaryColor;
                    } else {
                        diffSteps = leftDiff[noteValue];
                        newLeft = direction * diffSteps * x + origin;
                    }
                } else if (middle) {
                    // all altered notes should be in the middle
                    if (leftEmpty || rightEmpty) {
                        fillPercentage = 100;
                    } else if (leftFill || rightFill) {
                        fillPercentage = 0;
                    }
                    newLeft = origin;
                } else if (insideRight) {
                    // all altered notes should be x% to the left
                    x = ((progress - (i + rightWindow)) * 100) / windowLength;

                    if (rightEmpty) {
                        fillPercentage = 100 - x;
                    } else if (rightFill) {
                        fillPercentage = x;
                        background = secondaryColor;
                    } else {
                        diffSteps = rightDiff[noteValue];
                        newLeft = direction * diffSteps * x + origin;
                    }
                } else if (outsideRight) {
                    // all altered notes should be 50% to the right
                    if (rightEmpty) {
                        fillPercentage = 100;
                    } else if (rightFill) {
                        fillPercentage = 0;
                    } else {
                        diffSteps = rightDiff[noteValue];
                        newLeft = direction * diffSteps * 50 + origin;
                    }
                }

                // set position
                if (newLeft !== undefined) {
                    shadowRef.current.style.left = `${newLeft}%`;
                }

                if (fillPercentage !== undefined) {
                    diameter = (diameter * fillPercentage) / 100;
                }

                // set circle diameter
                const radius = diameter / 2;
                shadowRef.current.style.width = `${diameter}px`;
                shadowRef.current.style.height = `${diameter}px`;
                shadowRef.current.style.marginLeft = `-${radius}px`;
                shadowRef.current.style.marginRight = `-${radius}px`;
                shadowRef.current.style.top = `${getTopMargin(
                    fretHeight,
                    diameter
                )}px`;

                // set background color
                shadowRef.current.style.backgroundColor = background;
            }
        );
    }, []);

    function onContextMenu(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        e.preventDefault();
        // highlight note on right click
        store.dispatch({
            type: "SET_HIGHLIGHTED_NOTE",
            payload: {
                stringIndex,
                value,
            },
        });
    }

    function onClick(
        e:
            | React.TouchEvent<HTMLDivElement>
            | React.MouseEvent<HTMLDivElement, MouseEvent>
    ) {
        // highlight note if brush mode is highlight
        const highlightConditions = [brushModeRef.current === "highlight"];

        if (e.nativeEvent instanceof MouseEvent) {
            // highlight note if use is pressing shift + click or command + click
            highlightConditions.push(
                e.nativeEvent.metaKey,
                e.nativeEvent.shiftKey
            );
        } else if (e.nativeEvent instanceof TouchEvent) {
            // highlight note if using touch device and press with two fingers
            highlightConditions.push(e.nativeEvent.touches.length > 1);
        } else {
            return;
        }

        if (highlightConditions.some((condition) => condition)) {
            store.dispatch({
                type: "SET_HIGHLIGHTED_NOTE",
                payload: {
                    stringIndex,
                    value,
                },
            });
        } else {
            // toggle selection of note if highlight conditions arent met
            store.dispatch({
                type: "SET_NOTE",
                payload: {
                    note: value,
                },
            });
        }
    }

    return (
        <FretDiv
            border={border}
            width={fretWidth}
            height={fretHeight}
            onContextMenu={onContextMenu}
        >
            <StringSegmentDiv
                height={thickness}
                backgroundColor={!!fretIndex ? "#333" : "transparent"}
            />
            <CircleDiv
                onClick={onClick}
                onTouchStart={onClick}
                color={color}
                letterSpacing={
                    label !== "value" && note.getName(label).length > 1 ? -4 : 0
                }
            >
                {label === "value" ? noteValue : note.getName(label)}
            </CircleDiv>
            <ShadowDiv
                ref={shadowRef}
                backgroundColor={getBackgroundColor(isSelected, isHighlighted)}
                left={50}
                top={getTopMargin(fretboardHeight / 6, CIRCLE_SIZE)}
            />
            <StringSegmentDiv
                height={thickness}
                backgroundColor={!!fretIndex ? "#333" : "transparent"}
            />
        </FretDiv>
    );
};
