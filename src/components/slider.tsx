import * as React from "react";
import styled from "styled-components";
import { stopClick } from "../utils";
import { FretboardContext } from "../store";
import lodash from "lodash";

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

const ProgressBar = styled.div<CSSProps>`
	width: ${({ width }) => width}%;
	height: 30px;
	display: flex;
	align-items: center;
	justify-content: center;
	touch-action: none;
`;

const ProgressBarFragment = styled.div<CSSProps>`
	width: ${({ width }) => width}%;
	height: 30px;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: white;
	border: 1px solid #333;
	border-left: ${({ isFirst }) => (isFirst ? "1px solid #333" : "0")};
	border-top-left-radius: ${({ isFirst }) => (isFirst ? "4px" : "0")};
	border-bottom-left-radius: ${({ isFirst }) => (isFirst ? "4px" : "0")};
	border-top-right-radius: ${({ isLast }) => (isLast ? "4px" : "0")};
	border-bottom-right-radius: ${({ isLast }) => (isLast ? "4px" : "0")};
	color: #333;
	touch-action: none;
`;

const SliderBar = styled.div.attrs((props: CSSProps) => ({
	left: `${props.left}px`,
	width: `${props.width}%`,
}))<CSSProps>`
	left: ${({ left }) => left};
	width: ${({ width }) => width};
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

const ControlsContainer = styled.div<CSSProps>`
	display: flex;
	align-items: center;
	width: ${({ width }) => width}%;
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
	const [lastPos, setlastPos] = React.useState(0);
	const [delta, setDelta] = React.useState(0);
	const [left, setLeft] = React.useState(0);
	const [lastLeft, setLastLeft] = React.useState(0);
	// const [ratio, setRatio] = React.useState(0);

	// refs
	const focusedIndexRef = React.useRef<number>(state.focusedIndex);
	const fretboardsLengthRef = React.useRef<number>(state.fretboards.length);
	const draggingRef = React.useRef<boolean>(dragging);
	const lastPosRef = React.useRef<number>(lastPos);
	const deltaRef = React.useRef<number>(delta);
	const leftRef = React.useRef<number>(left);
	const lastLeftRef = React.useRef<number>(lastLeft);
	// const ratioRef = React.useRef<number>(ratio);

	focusedIndexRef.current = state.focusedIndex;
	fretboardsLengthRef.current = state.fretboards.length;
	draggingRef.current = dragging;
	leftRef.current = left;
	lastPosRef.current = lastPos;
	deltaRef.current = delta;
	lastLeftRef.current = lastLeft;

	// DOM refs
	const progressBarRef = React.useRef<HTMLDivElement>();
	const sliderBarRef = React.useRef<HTMLDivElement>();

	React.useEffect(() => {
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
			// window.removeEventListener("resize", onResize);
		};
	}, []);

	React.useLayoutEffect(() => {
		if (progressBarRef.current && sliderBarRef.current) {
			setLeft(progressBarRef.current.offsetLeft);
			setDelta(0);
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

	// slider drag release (set ratio for resize experiment)
	const onMouseUp = React.useCallback((event: MouseEvent | TouchEvent) => {
		event.preventDefault();
		if (draggingRef.current) {
			setDragging(false);
			setDelta(0);
			setLastLeft(sliderBarRef.current.offsetLeft);
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
			setlastPos(clientX);
			setDelta(0);
			setLastLeft(sliderBarRef.current.offsetLeft);
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
			// get widths, maxwidth is how far the left of the slider can move
			// aka full bar - width of slider
			const origin = progressBarRef.current.offsetLeft;
			const progressBarWidth = progressBarRef.current.offsetWidth;
			const sliderBarWidth = sliderBarRef.current.offsetWidth;
			const maxWidth = progressBarWidth - sliderBarWidth;

			// get the current focused fretboard index from progress of slider
			const progressBarFragmentWidth =
				progressBarWidth / fretboardsLengthRef.current;
			// const sliderProgressFragment = event.clientX - origin;
			const sliderProgressFragment = clientX - origin;
			const focusedIndex = Math.min(
				Math.max(
					Math.floor(
						sliderProgressFragment / progressBarFragmentWidth
					),
					0
				),
				fretboardsLengthRef.current - 1
			);

			// get delta of how far clientX has moved since lastPos, and move left that far

			// const newDelta = event.clientX - lastPosRef.current;
			const newDelta = clientX - lastPosRef.current;

			const newLeft = Math.min(
				Math.max(lastLeftRef.current + newDelta, origin),
				maxWidth + origin
			);

			// make changes
			setDelta(newDelta);
			setLeft(newLeft);
			if (focusedIndex !== focusedIndexRef.current) {
				dispatch({
					type: "SET_FOCUS",
					payload: { fretboardIndex: focusedIndex || 0 },
				});
			}
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

		// reposition slider
		if (progressBarRef.current && sliderBarRef.current) {
			// get widths, maxwidth is how far the left of the slider can move
			// aka full bar - width of slider
			const origin = progressBarRef.current.offsetLeft;
			const progressBarWidth = progressBarRef.current.offsetWidth;
			const sliderBarWidth = sliderBarRef.current.offsetWidth;
			const maxLeft = progressBarWidth - sliderBarWidth + origin;

			// we want to center slider on new click location,
			// so we take the click location - half the slider width

			// let newLeft = event.clientX - sliderBarWidth / 2;
			let newLeft = clientX - sliderBarWidth / 2;
			newLeft = Math.min(Math.max(newLeft, origin), maxLeft);

			// make changes
			setLeft(newLeft);
		}
	};

	return (
		<ContainerDiv>
			<ProgressBar
				ref={progressBarRef}
				width={70}
				onClick={onSliderClick}
				onTouchStart={onSliderClick}
			>
				<SliderBar
					ref={sliderBarRef}
					left={left}
					width={5}
					onMouseDown={onMouseDown}
					onTouchStart={onMouseDown}
				/>
				{state.fretboards.map((_, i) => {
					const setFocus = (
						event:
							| React.MouseEvent<HTMLDivElement, MouseEvent>
							| React.TouchEvent<HTMLDivElement>
					) => {
						event.preventDefault();
						dispatch({
							type: "SET_FOCUS",
							payload: { fretboardIndex: i },
						});
					};

					const isFirst = i === 0;
					const isLast = i === state.fretboards.length - 1;

					return (
						<ProgressBarFragment
							key={`button-pad-${i}`}
							width={100 / state.fretboards.length}
							onClick={setFocus}
							onTouchStart={setFocus}
							isFirst={isFirst}
							isLast={isLast}
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
