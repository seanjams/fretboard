import React, {
    useState,
    useEffect,
    useLayoutEffect,
    useRef,
    useCallback,
} from "react";
import styled from "styled-components";
import {
    stopClick,
    getCurrentProgression,
    getCurrentFretboards,
    getCurrentFretboard,
    getName,
    getNotes,
} from "../utils";
import { StateType, SliderStateType } from "../types";
import { Store } from "../store";
import { ChordSymbol } from "./symbol";

// CSS
interface CSSProps {
    left?: number;
    width?: number;
    isFirst?: boolean;
    isLast?: boolean;
    show?: boolean;
}

const ContainerDiv = styled.div<CSSProps>`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const ProgressBar = styled.div.attrs((props: CSSProps) => ({
    style: {
        width: `${props.width}%`,
    },
}))<CSSProps>`
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    touch-action: none;
`;

const ProgressBarFragment = styled.div.attrs((props: CSSProps) => ({
    style: {
        width: `calc(${props.width}% - ${
            props.isFirst || props.isLast ? "10" : "0"
        }px)`,
        borderLeft: `${props.isFirst ? "1px solid #333" : "0"}`,
        borderTopLeftRadius: `${props.isFirst ? "100000000000000px" : "0"}`,
        borderBottomLeftRadius: `${props.isFirst ? "100000000000000px" : "0"}`,
        borderTopRightRadius: `${props.isLast ? "100000000000000px" : "0"}`,
        borderBottomRightRadius: `${props.isLast ? "100000000000000px" : "0"}`,
        marginLeft: `${props.isFirst ? "10px" : "0"}`,
        marginRight: `${props.isLast ? "10px" : "0"}`,
    },
}))<CSSProps>`
    height: 10px;
    background-color: white;
    border: 1px solid #333;
    color: #333;
    touch-action: none;
    margin: 10px 0;
`;

const SliderBar = styled.div.attrs((props: CSSProps) => ({
    style: {
        left: `${props.left}px`,
        backgroundColor: props.show ? "red" : "transparent",
    },
}))<CSSProps>`
    height: 30px;
    width: 30px;
    position: absolute;
    z-index: 10001;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    color: #333;
    opacity: 0.5;
    touch-action: none;
    border-radius: 100000000000000px;
`;

const ProgressBarName = styled.div<CSSProps>`
    position: relative;
    top: 14px;
    padding-left: 6px;
    font-size: 12px;
`;

// Component
interface SliderProps {
    store: Store<StateType>;
    sliderStore: Store<SliderStateType>;
}

export const Slider: React.FC<SliderProps> = ({ store, sliderStore }) => {
    // state
    const stateRef = useRef(store.state);
    const { currentProgressionIndex } = stateRef.current;
    const currentProgression = getCurrentProgression(stateRef.current);

    // label
    const [label, setLabel] = useState(currentProgression.label);
    const labelRef = useRef(label);
    labelRef.current = label;

    // fretboards
    const [fretboards, setFretboards] = useState(currentProgression.fretboards);
    const fretboardsRef = useRef(fretboards);
    fretboardsRef.current = fretboards;

    // hiddenFretboardIndices
    const [hiddenFretboardIndices, setHiddenFretboardIndices] = useState(
        currentProgression.hiddenFretboardIndices
    );
    const hiddenFretboardIndicesRef = useRef(hiddenFretboardIndices);
    hiddenFretboardIndicesRef.current = hiddenFretboardIndices;

    // dragging
    const [dragging, setDragging] = useState(false);
    const draggingRef = useRef(dragging);
    draggingRef.current = dragging;

    // left
    const [left, setLeft] = useState(0);
    const leftRef = useRef(left);
    leftRef.current = left;

    // delta
    const [delta, setDelta] = useState(0);
    const deltaRef = useRef(delta);
    deltaRef.current = delta;

    // DOM refs
    const progressBarRef = useRef<HTMLDivElement>();
    const sliderBarRef = useRef<HTMLDivElement>();

    const visibleFretboards = fretboards.filter(
        (_, i) => !hiddenFretboardIndices.includes(i)
    );
    const updating =
        visibleFretboards.length !== currentProgression.fretboards.length;

    useEffect(() => {
        const destroy = store.addListener((newState) => {
            const currentProgression = getCurrentProgression(newState);
            const { label, fretboards, hiddenFretboardIndices } =
                currentProgression;
            if (label !== labelRef.current) setLabel(label);
            if (fretboards !== fretboardsRef.current) setFretboards(fretboards);
            if (hiddenFretboardIndices !== hiddenFretboardIndicesRef.current)
                setHiddenFretboardIndices(hiddenFretboardIndices);
        });

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        window.addEventListener("touchmove", onMouseMove);
        window.addEventListener("touchend", onMouseUp);
        return () => {
            destroy();
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
            window.removeEventListener("touchmove", onMouseMove);
            window.removeEventListener("touchend", onMouseUp);
        };
    }, []);

    const getProgressBarFragmentWidth = () => {
        let { hiddenFretboardIndices } = getCurrentProgression(
            stateRef.current
        );
        let fretboards = getCurrentFretboards(stateRef.current);
        fretboards = fretboards.filter(
            (_, i) => !hiddenFretboardIndices.includes(i)
        );
        return progressBarRef.current.offsetWidth / fretboards.length;
    };

    useLayoutEffect(() => {
        // set default position to be halfway through the fragment of the current focusedIndex
        if (sliderBarRef.current && progressBarRef.current) {
            const { hiddenFretboardIndices, focusedIndex } =
                getCurrentProgression(stateRef.current);

            // dont update if in middle of animation
            if (hiddenFretboardIndices.length) return;

            const progressBarFragmentWidth = getProgressBarFragmentWidth();
            const origin = progressBarRef.current.offsetLeft;
            const newLeft =
                progressBarFragmentWidth * (focusedIndex + 0.5) -
                sliderBarRef.current.offsetWidth / 2 +
                origin;
            setLeft(newLeft);
        }
    }, [
        fretboards.length, // when fretboards change length, so should the position of the slider
        currentProgressionIndex, // when updating progression, update position of slider
        updating,
        // updating && rootIdx,
        // updating && chordName,
    ]);

    const repositionSlider = useCallback((clientX: number) => {
        // get widths, maxwidth is how far the left of the slider can move
        // aka full bar - width of slider
        let { focusedIndex, fretboards, hiddenFretboardIndices } =
            getCurrentProgression(stateRef.current);
        fretboards = fretboards.filter(
            (_, i) => !hiddenFretboardIndices.includes(i)
        );
        const origin = progressBarRef.current.offsetLeft;
        const progressBarWidth = progressBarRef.current.offsetWidth;
        const sliderBarWidth = sliderBarRef.current.offsetWidth;
        const maxLeft = progressBarWidth - sliderBarWidth + origin;

        // we want to center slider on new click location,
        // so we take the click location - half the slider width
        const d = draggingRef.current ? deltaRef.current : sliderBarWidth / 2;
        const newLeft = Math.min(Math.max(clientX - d, origin), maxLeft);

        // get the current focused fretboard index from progress of slider
        const progressBarFragmentWidth = getProgressBarFragmentWidth();
        const sliderProgressFragment = newLeft + sliderBarWidth / 2 - origin;

        const newFocusedIndex = Math.min(
            Math.max(
                Math.floor(sliderProgressFragment / progressBarFragmentWidth),
                0
            ),
            fretboards.length - 1
        );

        // make changes
        setLeft(newLeft);

        // progress is decimal value of focusedIndex.
        // If you treat the slider bar as a number line, where the fretboard divisions
        // are the integers, progress is location on this number line.

        // TODO: rewrite this to use new store for progress
        sliderStore.setKey(
            "progress",
            Math.max(sliderProgressFragment / progressBarFragmentWidth, 0)
        );
        if (newFocusedIndex !== focusedIndex)
            store.reducers.setFocusedIndex(newFocusedIndex || 0);
    }, []);

    // slider drag release (set ratio for resize experiment)
    const onMouseUp = useCallback((event: MouseEvent | TouchEvent) => {
        event.preventDefault();
        event.stopPropagation();

        if (draggingRef.current) {
            setDragging(false);
            stopClick();
        }
        // const origin = progressBarRef.current.offsetLeft;
        // const progressBarWidth = progressBarRef.current.offsetWidth;
        // if (progressBarRef.current && sliderBarRef.current) {
        // 	setRatio((leftRef.current - origin) / progressBarWidth);
        // }
    }, []);

    // slider grab
    const onMouseDown = (
        event:
            | React.MouseEvent<HTMLDivElement, MouseEvent>
            | React.TouchEvent<HTMLDivElement>
    ) => {
        event.preventDefault();
        event.stopPropagation();

        let clientX;
        if (event.nativeEvent instanceof MouseEvent) {
            clientX = event.nativeEvent.clientX;
        } else if (event.nativeEvent instanceof TouchEvent) {
            clientX = event.nativeEvent.touches[0].clientX;
        } else {
            return;
        }

        // grab slider
        if (progressBarRef.current && sliderBarRef.current) {
            setDelta(clientX - sliderBarRef.current.offsetLeft);
        }
        if (!draggingRef.current) setDragging(true);
    };

    // slider drag
    const onMouseMove = useCallback((event: MouseEvent | TouchEvent) => {
        event.preventDefault();
        let clientX;
        if (event instanceof MouseEvent) {
            clientX = event.clientX;
        } else if (event instanceof TouchEvent) {
            clientX = event.touches[0].clientX;
        } else {
            return;
        }

        // drag slider
        if (
            progressBarRef.current &&
            sliderBarRef.current &&
            draggingRef.current
        ) {
            repositionSlider(clientX);
        }
    }, []);

    // progress bar click
    const onSliderClick = (
        event:
            | React.MouseEvent<HTMLDivElement, MouseEvent>
            | React.TouchEvent<HTMLDivElement>
    ) => {
        event.preventDefault();
        let clientX;
        if (event.nativeEvent instanceof MouseEvent) {
            clientX = event.nativeEvent.clientX;
        } else if (event.nativeEvent instanceof TouchEvent) {
            clientX = event.nativeEvent.touches[0].clientX;
        } else {
            return;
        }
        if (progressBarRef.current && sliderBarRef.current) {
            repositionSlider(clientX);
        }
    };

    return (
        <ContainerDiv>
            <ProgressBar
                id="progress-bar"
                ref={progressBarRef}
                width={100}
                onClick={onSliderClick}
                onTouchStart={onSliderClick}
            >
                <SliderBar
                    id="slider-bar"
                    ref={sliderBarRef}
                    left={left}
                    onMouseDown={onMouseDown}
                    onTouchStart={onMouseDown}
                    show={true}
                />
                {visibleFretboards.map((fretboard, i) => {
                    const [rootIdx, rootName, chordName, chordNotes] = getName(
                        getNotes(fretboard),
                        label
                    );
                    return (
                        <ProgressBarFragment
                            key={`button-pad-${i}`}
                            width={100 / visibleFretboards.length}
                            isFirst={i === 0}
                            isLast={i === visibleFretboards.length - 1}
                        >
                            <ProgressBarName>
                                <ChordSymbol
                                    rootName={rootName}
                                    chordName={chordName || chordNotes}
                                    fontSize={12}
                                />
                            </ProgressBarName>
                        </ProgressBarFragment>
                    );
                })}
            </ProgressBar>
        </ContainerDiv>
    );
};
