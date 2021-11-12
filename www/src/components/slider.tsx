import React, {
    useState,
    useEffect,
    useLayoutEffect,
    useRef,
    useCallback,
} from "react";
import styled from "styled-components";
import { stopClick, currentProgression, getName, getNotes } from "../utils";
import { StateType, SliderStateType } from "../types";
import { Store, useStateRef } from "../store";
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
    const progression = currentProgression(store.state);
    const [getState, setState] = useStateRef({
        label: progression.label,
        hiddenFretboardIndices: progression.hiddenFretboardIndices,
        rehydrateSuccess: sliderStore.state.rehydrateSuccess,
        currentProgressionIndex: store.state.currentProgressionIndex,
        visibleFretboards: progression.fretboards.filter(
            (_, i) => !progression.hiddenFretboardIndices.includes(i)
        ),
        left: 0,
        progress: 0,
    });
    const {
        label,
        left,
        rehydrateSuccess,
        currentProgressionIndex,
        visibleFretboards,
    } = getState();

    // refs
    const draggingRef = useRef(false);
    const deltaRef = useRef(0);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const sliderBarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const destroySliderListener = sliderStore.addListener(
            (newSliderData) => {
                // old data
                const state = getState();
                // new data
                const { rehydrateSuccess, progress } = newSliderData;
                // only update if these conditions are met
                const updateConditions: boolean[] = [
                    state.rehydrateSuccess !== rehydrateSuccess,
                ];
                //update
                if (updateConditions.some((c) => c))
                    setState({
                        ...state,
                        rehydrateSuccess,
                    });
            }
        );

        const destroyListener = store.addListener((newData) => {
            // old data
            const state = getState();
            // new data
            const { currentProgressionIndex } = newData;
            const { label, fretboards, hiddenFretboardIndices } =
                currentProgression(newData);
            const visibleFretboards = fretboards.filter(
                (_, i) => !hiddenFretboardIndices.includes(i)
            );
            // only update if these conditions are met
            const updateConditions: boolean[] = [
                state.label !== label,
                state.hiddenFretboardIndices !== hiddenFretboardIndices,
                state.currentProgressionIndex !== currentProgressionIndex,
                state.visibleFretboards !== visibleFretboards,
            ];
            //update
            if (updateConditions.some((c) => c)) {
                setState({
                    ...state,
                    label,
                    hiddenFretboardIndices,
                    currentProgressionIndex,
                    visibleFretboards,
                });
            }
        });

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        window.addEventListener("touchmove", onMouseMove);
        window.addEventListener("touchend", onMouseUp);
        return () => {
            destroyListener();
            destroySliderListener();
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
            window.removeEventListener("touchmove", onMouseMove);
            window.removeEventListener("touchend", onMouseUp);
        };
    }, []);

    useEffect(() => {
        // set default position to be halfway through the fragment of the current focusedIndex
        if (sliderBarRef.current && progressBarRef.current) {
            const state = getState();
            const progression = currentProgression(store.state);
            const { focusedIndex } = progression;
            // dont update if in middle of animation
            const { hiddenFretboardIndices } = state;
            if (hiddenFretboardIndices && hiddenFretboardIndices.length) return;

            const progressBarFragmentWidth = getProgressBarFragmentWidth();
            const origin = progressBarRef.current.offsetLeft;
            const newLeft =
                progressBarFragmentWidth * (focusedIndex + 0.5) -
                sliderBarRef.current.offsetWidth / 2 +
                origin;

            setState({
                ...state,
                left: newLeft,
            });
        }
    }, [
        rehydrateSuccess, // when state successfully imported from localStorage, reset slider
        currentProgressionIndex, // when updating progression, reset slider
        visibleFretboards.length, // when fretboards change length, reset slider
    ]);

    const getProgressBarFragmentWidth = () => {
        const { visibleFretboards } = getState();
        const width = progressBarRef.current
            ? progressBarRef.current.offsetWidth
            : 0;
        return width / Math.max(visibleFretboards.length, 1);
    };

    const repositionSlider = (clientX: number) => {
        if (!progressBarRef.current || !sliderBarRef.current) return;

        // get widths, maxwidth is how far the left of the slider can move
        // aka full bar - width of slider
        let state = getState();
        const { visibleFretboards } = state;
        const progression = currentProgression(store.state);
        const { focusedIndex } = progression;
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
            visibleFretboards.length - 1
        );

        // progress is decimal value of focusedIndex.
        // If you treat the slider bar as a number line, where the fretboard divisions
        // are the integers, progress is location on this number line.
        sliderStore.reducers.setProgress(
            Math.max(sliderProgressFragment / progressBarFragmentWidth, 0)
        );

        if (newFocusedIndex !== focusedIndex)
            store.reducers.setFocusedIndex(newFocusedIndex || 0);

        // update slider position
        setState({
            ...state,
            left: newLeft,
        });
    };

    // slider drag release (set ratio for resize experiment)
    const onMouseUp = (event: MouseEvent | TouchEvent) => {
        event.preventDefault();
        event.stopPropagation();

        if (draggingRef.current) {
            draggingRef.current = false;
            stopClick();
        }
    };

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
        if (progressBarRef.current && sliderBarRef.current)
            deltaRef.current = clientX - sliderBarRef.current.offsetLeft;
        if (!draggingRef.current) draggingRef.current = true;
    };

    // slider drag
    const onMouseMove = (event: MouseEvent | TouchEvent) => {
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
    };

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
                    const { rootName, chordName } = getName(
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
                                    chordName={chordName}
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
