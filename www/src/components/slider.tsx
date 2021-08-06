import React, {
    useState,
    useEffect,
    useLayoutEffect,
    useRef,
    useCallback,
} from "react";
import styled from "styled-components";
import { stopClick } from "../utils";
import {
    Store,
    useStore,
    StateType,
    DEFAULT_STATE,
    ActionTypes,
} from "../store";
// import lodash from "lodash";

// CSS
interface CSSProps {
    left?: number;
    width?: number;
    isFirst?: boolean;
    isLast?: boolean;
}

const ContainerDiv = styled.div<CSSProps>`
    width: 80vw;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 10px 0 20px 0;
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
        width: `${props.width}%`,
        borderLeft: `${props.isFirst ? "1px solid #333" : "0"}`,
        borderTopLeftRadius: `${props.isFirst ? "4px" : "0"}`,
        borderBottomLeftRadius: `${props.isFirst ? "4px" : "0"}`,
        borderTopRightRadius: `${props.isLast ? "4px" : "0"}`,
        borderBottomRightRadius: `${props.isLast ? "4px" : "0"}`,
    },
}))<CSSProps>`
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: white;
    border: 1px solid #333;
    color: #333;
    touch-action: none;
`;

const SliderBar = styled.div.attrs((props: CSSProps) => ({
    style: {
        left: `${props.left}px`,
        width: `${props.width}%`,
    },
}))<CSSProps>`
    height: 30px;
    position: absolute;
    z-index: 10001;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: red;
    border-radius: 4px;
    color: #333;
    opacity: 0.5;
    touch-action: none;
`;

const ControlsContainer = styled.div.attrs((props: CSSProps) => ({
    style: {
        width: `${props.width}%`,
    },
}))<CSSProps>`
    display: flex;
    align-items: center;
    font-size: 10px;
`;

const ButtonContainer = styled.div<CSSProps>`
    margin: 0 10px;
`;

const ButtonInput = styled.button<CSSProps>`
    height: 30px;
    font-size: 14px;
    white-space: nowrap;
    min-width: 30px;
`;

// Component
interface SliderProps {
    store: Store<StateType, ActionTypes>;
}

export const Slider: React.FC<SliderProps> = ({ store }) => {
    const [state, setState] = useStore(store);
    const [dragging, setDragging] = useState(false);
    const [left, setLeft] = useState(0);
    const [delta, setDelta] = useState(0);
    // const [ratio, setRatio] = useState(0);

    // refs
    const draggingRef = useRef(false);
    const leftRef = useRef(0);
    const deltaRef = useRef(0);
    const stateRef = useRef(DEFAULT_STATE());
    // const ratioRef = useRef<number>(ratio);

    draggingRef.current = dragging;
    leftRef.current = left;
    deltaRef.current = delta;
    stateRef.current = state;

    // DOM refs
    const progressBarRef = useRef<HTMLDivElement>();
    const sliderBarRef = useRef<HTMLDivElement>();

    useEffect(() => {
        // const unsubscribe = useStore.subscribe(
        // 	(progress: number) => {
        // 		progressRef.current = progress;
        // 		// setProgressRef.current = setProgress;
        // 	},
        // 	(store) => store.progress
        // );

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        window.addEventListener("touchmove", onMouseMove);
        window.addEventListener("touchend", onMouseUp);
        // window.addEventListener("resize", onResize);
        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
            window.removeEventListener("touchmove", onMouseMove);
            window.removeEventListener("touchend", onMouseUp);
            // unsubscribe();
            // window.removeEventListener("resize", onResize);
        };
    }, []);

    function getProgressBarFragmentWidth() {
        return (
            progressBarRef.current.offsetWidth /
            stateRef.current.fretboards.length
        );
    }

    useLayoutEffect(() => {
        // set default position to be halfway through the fragment of the current focusedIndex
        if (sliderBarRef.current && progressBarRef.current) {
            const progressBarFragmentWidth = getProgressBarFragmentWidth();
            const origin = progressBarRef.current.offsetLeft;
            const newLeft =
                progressBarFragmentWidth *
                    (stateRef.current.focusedIndex + 0.5) -
                sliderBarRef.current.offsetWidth / 2 +
                origin;
            setLeft(newLeft);
        }
    }, [stateRef.current.rehydrateSuccess, stateRef.current.fretboards.length]);

    // Drag event listeners
    // const onResize = lodash.debounce((event: UIEvent) => {
    // 	event.preventDefault();
    // 	const origin = progressBarRef.current.offsetLeft;
    // 	const progressBarWidth = progressBarRef.current.offsetWidth;
    // 	if (progressBarRef.current && sliderBarRef.current) {
    // 		setLeft(progressBarWidth * ratioRef.current - origin);
    // 	}
    // }, 100);

    const repositionSlider = useCallback((clientX: number) => {
        // get widths, maxwidth is how far the left of the slider can move
        // aka full bar - width of slider
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

        const focusedIndex = Math.min(
            Math.max(
                Math.floor(sliderProgressFragment / progressBarFragmentWidth),
                0
            ),
            stateRef.current.fretboards.length - 1
        );

        // make changes
        setLeft(newLeft);

        // progress is decimal value of focusedIndex.
        // If you treat the slider bar as a number line, where the fretboard divisions
        // are the integers, progress is location on this number line.
        store.setKey(
            "progress",
            Math.max(sliderProgressFragment / progressBarFragmentWidth, 0)
        );
        if (focusedIndex !== stateRef.current.focusedIndex)
            store.setKey("focusedIndex", focusedIndex || 0);
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
                width={70}
                onClick={onSliderClick}
                onTouchStart={onSliderClick}
            >
                <SliderBar
                    id="slider-bar"
                    ref={sliderBarRef}
                    left={left}
                    width={5}
                    onMouseDown={onMouseDown}
                    onTouchStart={onMouseDown}
                />
                {state.fretboards.map((_, i) => {
                    return (
                        <ProgressBarFragment
                            key={`button-pad-${i}`}
                            width={100 / state.fretboards.length}
                            isFirst={i === 0}
                            isLast={i === state.fretboards.length - 1}
                        >
                            {`board ${i + 1}`}
                        </ProgressBarFragment>
                    );
                })}
            </ProgressBar>
            <ControlsContainer width={20}>
                <ButtonContainer>
                    <ButtonInput
                        onClick={() =>
                            store.dispatch({ type: "ADD_FRETBOARD" })
                        } // maybe preventDefault
                        onTouchStart={() =>
                            store.dispatch({ type: "ADD_FRETBOARD" })
                        }
                    >
                        &#43;
                    </ButtonInput>
                </ButtonContainer>
                <ButtonContainer>
                    <ButtonInput
                        onClick={() =>
                            store.dispatch({ type: "REMOVE_FRETBOARD" })
                        }
                        onTouchStart={() =>
                            store.dispatch({ type: "REMOVE_FRETBOARD" })
                        }
                    >
                        &minus;
                    </ButtonInput>
                </ButtonContainer>
            </ControlsContainer>
        </ContainerDiv>
    );
};
