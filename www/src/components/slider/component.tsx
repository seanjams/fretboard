import React, { useEffect, useMemo, useRef } from "react";
import {
    stopClick,
    getName,
    getNotes,
    getVisibleFretboards,
} from "../../utils";
import { useStateRef, AppStore, SliderStore, current } from "../../store";
import { ChordSymbol } from "../symbol";
import {
    ContainerDiv,
    ProgressBar,
    ProgressBarFragment,
    ProgressBarName,
    SliderBar,
} from "./style";

interface SliderProps {
    store: AppStore;
    sliderStore: SliderStore;
}

export const Slider: React.FC<SliderProps> = ({ store, sliderStore }) => {
    // state
    const { progression } = current(store.state);
    const [getState, setState] = useStateRef(
        useMemo(
            () => ({
                label: progression.label,
                hiddenFretboardIndices: progression.hiddenFretboardIndices,
                rehydrateSuccess: sliderStore.state.rehydrateSuccess,
                currentProgressionIndex: store.state.currentProgressionIndex,
                visibleFretboards: getVisibleFretboards(
                    progression.fretboards,
                    progression.hiddenFretboardIndices
                ),
                left: 0,
                progress: 0,
            }),
            []
        )
    );
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
                const { rehydrateSuccess } = newSliderData;
                if (getState().rehydrateSuccess !== rehydrateSuccess)
                    setState((prevState) => ({
                        ...prevState,
                        rehydrateSuccess,
                    }));
            }
        );

        const destroyListener = store.addListener((newData) => {
            const { currentProgressionIndex, progression } = current(newData);
            const { label, fretboards, hiddenFretboardIndices } = progression;
            const visibleFretboards = getVisibleFretboards(
                fretboards,
                hiddenFretboardIndices
            );

            if (
                getState().label !== label ||
                getState().hiddenFretboardIndices !== hiddenFretboardIndices ||
                getState().currentProgressionIndex !==
                    currentProgressionIndex ||
                getState().visibleFretboards !== visibleFretboards
            ) {
                setState((prevState) => ({
                    ...prevState,
                    label,
                    hiddenFretboardIndices,
                    currentProgressionIndex,
                    visibleFretboards,
                }));
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
            const { focusedIndex } = current(store.state).progression;

            // dont update if in middle of animation
            const { hiddenFretboardIndices } = getState();
            if (hiddenFretboardIndices && hiddenFretboardIndices.length) return;

            const progressBarFragmentWidth = getProgressBarFragmentWidth();
            const origin = progressBarRef.current.offsetLeft;
            const newLeft =
                progressBarFragmentWidth * (focusedIndex + 0.5) -
                sliderBarRef.current.offsetWidth / 2 +
                origin;

            setState((prevState) => ({
                ...prevState,
                left: newLeft,
            }));
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
        const { visibleFretboards } = getState();
        const { focusedIndex } = current(store.state).progression;
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
        sliderStore.dispatch.setProgress(
            Math.max(sliderProgressFragment / progressBarFragmentWidth, 0)
        );

        if (newFocusedIndex !== focusedIndex)
            store.dispatch.setFocusedIndex(newFocusedIndex || 0);

        // update slider position
        setState((prevState) => ({
            ...prevState,
            left: newLeft,
        }));
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
                width="100%"
                onClick={onSliderClick}
                onTouchStart={onSliderClick}
            >
                <SliderBar
                    id="slider-bar"
                    ref={sliderBarRef}
                    left={`${left}px`}
                    onMouseDown={onMouseDown}
                    onTouchStart={onMouseDown}
                    show={true}
                />
                {visibleFretboards.map((fretboard, i) => {
                    const { rootName, chordName } = getName(
                        getNotes(fretboard),
                        label
                    )[0];
                    return (
                        <ProgressBarFragment
                            key={`button-pad-${i}`}
                            width={`${100 / visibleFretboards.length}%`}
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
