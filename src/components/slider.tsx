import * as React from "react";
import styled from "styled-components";
import { stopClick } from "../utils";
import { FretboardContext, useStore } from "../store";
// import lodash from "lodash";

// CSS
interface CSSProps {
	left?: number;
	width?: number;
	isFirst?: boolean;
	isLast?: boolean;
}

const ContainerDiv = styled.div<CSSProps>`
	width: 100vw;
	display: flex;
	align-items: center;
	justify-content: center;
	margin: 20px 0 10px 0;
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
interface SliderProps {}

export const Slider: React.FC<SliderProps> = () => {
	const { state, dispatch } = React.useContext(FretboardContext);
	const [dragging, setDragging] = React.useState(false);
	const [left, setLeft] = React.useState(0);
	const [delta, setDelta] = React.useState(0);
	const setProgress = useStore((store) => store.setProgress);
	// const [ratio, setRatio] = React.useState(0);

	// refs
	const focusedIndexRef = React.useRef<number>(state.focusedIndex);
	const fretboardsLengthRef = React.useRef<number>(state.fretboards.length);
	const draggingRef = React.useRef<boolean>(dragging);
	const leftRef = React.useRef<number>(left);
	const deltaRef = React.useRef<number>(delta);
	// const ratioRef = React.useRef<number>(ratio);

	focusedIndexRef.current = state.focusedIndex;
	fretboardsLengthRef.current = state.fretboards.length;
	draggingRef.current = dragging;
	leftRef.current = left;
	deltaRef.current = delta;

	// DOM refs
	const progressBarRef = React.useRef<HTMLDivElement>();
	const sliderBarRef = React.useRef<HTMLDivElement>();

	React.useEffect(() => {
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

	React.useLayoutEffect(() => {
		if (progressBarRef.current && sliderBarRef.current) {
			setLeft(progressBarRef.current.offsetLeft);
		}
	}, []);

	// Drag event listeners
	// const onResize = lodash.debounce((event: UIEvent) => {
	// 	event.preventDefault();
	// 	const origin = progressBarRef.current.offsetLeft;
	// 	const progressBarWidth = progressBarRef.current.offsetWidth;
	// 	if (progressBarRef.current && sliderBarRef.current) {
	// 		setLeft(progressBarWidth * ratioRef.current - origin);
	// 	}
	// }, 100);

	const repositionSlider = (clientX: number) => {
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
		const progressBarFragmentWidth =
			progressBarWidth / fretboardsLengthRef.current;
		const sliderProgressFragment = clientX - origin;
		const focusedIndex = Math.min(
			Math.max(
				Math.floor(sliderProgressFragment / progressBarFragmentWidth),
				0
			),
			fretboardsLengthRef.current - 1
		);

		// make changes
		setLeft(newLeft);

		// uses zustand store for transient updates, progress is decimal value of focusedIndex.
		// If you treat the slider bar as a number line, where the fretboard divisions
		// are the integers, progress is location on this number line.
		setProgress(
			Math.max(sliderProgressFragment / progressBarFragmentWidth, 0)
		);

		if (focusedIndex !== focusedIndexRef.current) {
			dispatch({
				type: "SET_FOCUS",
				payload: { fretboardIndex: focusedIndex || 0 },
			});
		}
	};

	// slider drag release (set ratio for resize experiment)
	const onMouseUp = React.useCallback((event: MouseEvent | TouchEvent) => {
		event.preventDefault();
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
	const onMouseMove = React.useCallback((event: MouseEvent | TouchEvent) => {
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
						onClick={() => dispatch({ type: "ADD_FRETBOARD" })} // maybe preventDefault
						onTouchStart={() => dispatch({ type: "ADD_FRETBOARD" })}
					>
						&#43;
					</ButtonInput>
				</ButtonContainer>
				<ButtonContainer>
					<ButtonInput
						onClick={() => dispatch({ type: "REMOVE_FRETBOARD" })}
						onTouchStart={() =>
							dispatch({ type: "REMOVE_FRETBOARD" })
						}
					>
						&minus;
					</ButtonInput>
				</ButtonContainer>
			</ControlsContainer>
		</ContainerDiv>
	);
};
