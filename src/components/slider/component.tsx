import React, { useEffect, useMemo, useRef } from "react";
import { CSSTransition } from "react-transition-group";
import {
    stopClick,
    SLIDER_WINDOW_LENGTH,
    SLIDER_RIGHT_WINDOW,
    SLIDER_LEFT_WINDOW,
} from "../../utils";
import {
    useStateRef,
    AppStore,
    getComputedAppState,
    AudioStore,
} from "../../store";
import { ChordSymbol } from "../ChordSymbol";
import { FlexRow } from "../Common";
import {
    AnimationWrapper,
    ProgressBar,
    ProgressBarFragment,
    ProgressBarName,
    SliderBar,
} from "./style";
import { isEqual } from "lodash";

interface SliderProps {
    appStore: AppStore;
    audioStore: AudioStore;
}

export const Slider: React.FC<SliderProps> = ({ appStore, audioStore }) => {
    // state
    const computedState = appStore.getComputedState();
    const [getState, setState] = useStateRef(() => ({
        visibleFretboards: computedState.visibleFretboards,
        left: -1000000,
        dragging: false,
    }));
    const { left, visibleFretboards, dragging } = getState();

    // refs
    const deltaRef = useRef(0);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const sliderBarRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<ReturnType<typeof requestAnimationFrame>>();
    const isAnimatingRef = useRef(computedState.isAnimating);
    const isSliderDisplayRef = useRef(appStore.state.display === "slider");

    useEffect(() => {
        const destroyAppStoreListener = appStore.addListener((newState) => {
            const { visibleFretboards, isAnimating, display } =
                getComputedAppState(newState);
            const isSliderDisplay = display === "slider";
            const visibleFretboardsChanged = !isEqual(
                getState().visibleFretboards,
                visibleFretboards
            );

            if (visibleFretboardsChanged) {
                setState({
                    visibleFretboards: JSON.parse(
                        JSON.stringify(visibleFretboards)
                    ),
                });
            }

            if (
                isAnimatingRef.current !== isAnimating ||
                isSliderDisplayRef.current !== isSliderDisplay
            ) {
                isAnimatingRef.current = isAnimating;
                isSliderDisplayRef.current = isSliderDisplay;
                if (isAnimating) setLeftFromProgress();
            }
        });

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        window.addEventListener("touchmove", onMouseMove);
        window.addEventListener("touchend", onMouseUp);

        // set initial slider position
        setLeftFromProgress();

        return () => {
            destroyAppStoreListener();
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
            window.removeEventListener("touchmove", onMouseMove);
            window.removeEventListener("touchend", onMouseUp);
        };
    }, []);

    const setLeftFromProgress = () => {
        if (!progressBarRef.current || !sliderBarRef.current) return;
        const { visibleFretboards, currentFretboardIndex } =
            appStore.getComputedState();
        const progressBarFragmentWidth =
            getProgressBarFragmentWidth(visibleFretboards);
        const origin = progressBarRef.current.offsetLeft;
        const left =
            progressBarFragmentWidth * (currentFretboardIndex + 0.5) -
            sliderBarRef.current.offsetWidth / 2 +
            origin;

        setState({ left });
    };

    const getProgressBarFragmentWidth = (visibleFretboards: any[]) => {
        const width = progressBarRef.current
            ? progressBarRef.current.offsetWidth
            : 0;
        return width / Math.max(visibleFretboards.length, 1);
    };

    const repositionSlider = (clientX: number) => {
        if (!progressBarRef.current || !sliderBarRef.current) return;

        // get widths, maxwidth is how far the left of the slider can move
        // aka full bar - width of slider
        const { visibleFretboards, dragging } = getState();
        const origin = progressBarRef.current.offsetLeft;
        const progressBarWidth = progressBarRef.current.offsetWidth;
        const sliderBarWidth = sliderBarRef.current.offsetWidth;
        const maxLeft = progressBarWidth - sliderBarWidth + origin;

        // we want to center slider on new click location,
        // so we take the click location - half the slider width
        const d = dragging ? deltaRef.current : sliderBarWidth / 2;
        const newLeft = Math.min(Math.max(clientX - d, origin), maxLeft);

        // get the current focused fretboard index from progress of slider
        const progressBarFragmentWidth =
            getProgressBarFragmentWidth(visibleFretboards);
        const sliderProgressFragment = newLeft + sliderBarWidth / 2 - origin;

        // progress is decimal value of currentFretboardIndex.
        // If you treat the slider bar as a number line, where the fretboard divisions
        // are the integers, progress is location on this number line.
        appStore.dispatch.setProgress(
            sliderProgressFragment / progressBarFragmentWidth
        );

        // update slider position
        setState({
            left: newLeft,
        });
    };

    const snapToGridAnimation = () => {
        if (!progressBarRef.current || !sliderBarRef.current) return;

        // cancel past animation if pressed quickly
        if (animationRef.current) cancelAnimationFrame(animationRef.current);

        const { visibleFretboards, currentFretboardIndex } =
            appStore.getComputedState();
        const origin = progressBarRef.current.offsetLeft;
        const sliderBarWidth = sliderBarRef.current.offsetWidth;

        // aliases for
        const leftSlideWindow = currentFretboardIndex + SLIDER_LEFT_WINDOW;
        const rightSlideWindow = currentFretboardIndex + SLIDER_RIGHT_WINDOW;
        const halfSlideWindow = currentFretboardIndex + 0.5;

        // only go to edge of slider window to make animation smoother
        let nextProgress = appStore.state.progress;
        let lastProgress =
            nextProgress > rightSlideWindow
                ? rightSlideWindow
                : nextProgress < leftSlideWindow
                ? leftSlideWindow
                : halfSlideWindow;

        const { left } = getState();
        let nextLeft = left;
        let lastLeft =
            origin +
            getProgressBarFragmentWidth(visibleFretboards) * halfSlideWindow -
            sliderBarWidth / 2;

        let frameCount = 0;
        let animationDuration = 0.15; // 0.15 seconds roughly comes out to 9 frames
        let totalFrames = Math.ceil(animationDuration * 60);
        let animationLeftLength = lastLeft - nextLeft;
        let animationProgressLength = lastProgress - nextProgress;

        const performAnimation = () => {
            animationRef.current = requestAnimationFrame(performAnimation);

            frameCount++;

            // linear animation
            nextLeft += animationLeftLength / totalFrames;
            nextProgress += animationProgressLength / totalFrames;

            // sinusoidal animation
            // nextProgress +=
            //     2 *
            //     (SLIDER_WINDOW_LENGTH / totalFrames) *
            //     Math.sin((Math.PI * frameCount) / totalFrames) ** 2;

            // increment progress and left on each frame
            setState({ left: nextLeft });
            appStore.dispatch.setProgress(nextProgress);
            if (frameCount === totalFrames) {
                // clear interval
                cancelAnimationFrame(animationRef.current);
                setState({ left: lastLeft });
                appStore.dispatch.setProgress(halfSlideWindow);
            }
        };
        requestAnimationFrame(performAnimation);
    };

    // slider drag release (set ratio for resize experiment)
    const onMouseUp = (event: MouseEvent | TouchEvent) => {
        event.stopPropagation();

        if (getState().dragging) {
            setState({ dragging: false });
            stopClick();
            // snap to grid if click or drag release
            snapToGridAnimation();
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
        if (!getState().dragging) setState({ dragging: true });
    };

    // slider drag
    const onMouseMove = (event: MouseEvent | TouchEvent) => {
        // event.preventDefault();
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
            getState().dragging
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
            setTimeout(snapToGridAnimation, 0);
        }
    };

    return (
        <FlexRow width="100%">
            {visibleFretboards.length > 1 && (
                <ProgressBar
                    id="progress-bar"
                    ref={progressBarRef}
                    width="100%"
                    onClick={onSliderClick}
                    onTouchStart={onSliderClick}
                >
                    <AnimationWrapper minSliderSize={44} maxSliderSize={50}>
                        <CSSTransition
                            in={dragging}
                            timeout={50}
                            classNames="slider-grow"
                            // onEnter={() => setShowButton(false)}
                            // onExited={() => setShowButton(true)}
                        >
                            <SliderBar
                                className="slider-bar"
                                ref={sliderBarRef}
                                left={`${left}px`}
                                onMouseDown={onMouseDown}
                                onTouchStart={onMouseDown}
                                show={true}
                            />
                        </CSSTransition>
                    </AnimationWrapper>
                    {visibleFretboards.map((_, i) => {
                        return (
                            <ProgressBarFragment
                                key={`button-pad-${i}`}
                                width={`${100 / visibleFretboards.length}%`}
                                isFirst={i === 0}
                                isLast={i === visibleFretboards.length - 1}
                            />
                        );
                    })}
                </ProgressBar>
            )}
        </FlexRow>
    );
};
