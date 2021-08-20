import React, { useRef, useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import { Store, StateType, useStore, ActionTypes, useStateRef } from "../store";
import { LabelTypes, ArrowTypes, BrushTypes } from "../types";
import { getPositionActionType, COLORS } from "../utils";
import PlusIcon from "../assets/icons/plus.png";
import MinusIcon from "../assets/icons/minus.png";
import LeftIcon from "../assets/icons/left-arrow.png";
import DownIcon from "../assets/icons/down-arrow.png";
import UpIcon from "../assets/icons/up-arrow.png";
import RightIcon from "../assets/icons/right-arrow.png";
import ClearIcon from "../assets/icons/clear.png";

const [secondaryColor, primaryColor] = COLORS[0];

// CSS
interface CSSProps {
    width?: number;
    backgroundColor?: string;
    activeColor?: string;
    active?: boolean;
    border?: string;
}

// const TextContainer = styled.div<CSSProps>`
// 	font-family: Arial;
// 	font-size: 14px;
// 	padding-left: 40px;
// `;

const ButtonBank = styled.div<CSSProps>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 10px;
    background: transparent;
    width: 100vw;
    margin: 5px 0 10px 0;
`;

const FlexRowCenter = styled.div<CSSProps>`
    display: flex;
    align-items: center;
    justify-content: center;
`;

const SelectInput = styled.select<CSSProps>`
    height: 28px;
    font-size: 14px;
    white-space: nowrap;
    min-width: 28px;
    margin: 0 10px;
`;

const ButtonInput = styled.button<CSSProps>`
    height: 28px;
    font-size: 14px;
    white-space: nowrap;
    min-width: 28px;
    margin: 0 10px;
`;

const Spacer = styled.div<CSSProps>`
    height: 28px;
    min-width: 97px;
`;

const ButtonArrow = styled.button<CSSProps>`
    font-size: 14px;
    margin: 3px;
`;

const ArrowControlsContainer = styled.div<CSSProps>`
    display: flex;
    align-items: center;
    margin: 0 10px;
`;

const ArrowControlsMiddleColumn = styled.div<CSSProps>`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
`;

const CircleControlsContainer = styled.div<CSSProps>`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
`;

const Circle = styled.div.attrs((props: CSSProps) => {
    return {
        style: {
            backgroundColor: props.active
                ? props.activeColor
                : props.backgroundColor,
            border: props.border,
        },
    };
})<CSSProps>`
    width: 26px;
    height: 26px;
    border-radius: 100%;
    margin-left: 5px;
    margin-right: 5px;
    text-align: center;
    line-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const Label = styled.div<CSSProps>`
    width: 30px;
    height: 8px;
    margin: 3px 5px;
    font-size: 9px;
    text-align: center;
`;

// Component
interface Props {
    store: Store<StateType, ActionTypes>;
}

// export const NavControls: React.FC<Props> = ({ store }) => {
//     const [state, setState] = useStore(store);
//     const [invert, setInvert] = useState(state.invert);
//     const [leftHand, setLeftHand] = useState(state.leftHand);

//     const invertRef = useRef(invert);
//     const leftHandRef = useRef(leftHand);
//     invertRef.current = invert;
//     leftHandRef.current = leftHand;

//     useEffect(() => {
//         store.addListener((newState) => {
//             if (newState.invert !== invertRef.current)
//                 setInvert(newState.invert);
//             if (newState.leftHand !== leftHandRef.current)
//                 setLeftHand(newState.leftHand);
//         });
//     }, []);

//     function onInvert(
//         e:
//             | React.MouseEvent<HTMLButtonElement, MouseEvent>
//             | React.TouchEvent<HTMLButtonElement>
//     ) {
//         e.preventDefault();
//         if (invertRef.current) {
//             window.scroll(0, 0);
//         } else {
//             window.scroll(document.body.scrollWidth, 0);
//         }
//         store.setKey("invert", !invertRef.current);
//     }

//     function onLeftHand(
//         e:
//             | React.MouseEvent<HTMLButtonElement, MouseEvent>
//             | React.TouchEvent<HTMLButtonElement>
//     ) {
//         e.preventDefault();
//         store.setKey("leftHand", !leftHandRef.current);
//     }

//     const onArrowPress = (direction: ArrowTypes) => () => {
//         const actionType = getPositionActionType(
//             invertRef.current,
//             leftHandRef.current,
//             direction
//         );

//         if (actionType) {
//             store.dispatch({ type: actionType });
//         }
//     };

//     const onLabelChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
//         const value = e.currentTarget.value as LabelTypes;
//         store.dispatch({
//             type: "SET_LABEL",
//             payload: { label: value },
//         });
//     };

//     return (
//         <ButtonBank>
//             <FlexRowCenter>
//                 <Spacer />
//                 <ButtonInput
//                     onClick={() => store.dispatch({ type: "CLEAR" })}
//                     onTouchStart={() => store.dispatch({ type: "CLEAR" })}
//                 >
//                     Clear
//                 </ButtonInput>
//                 <ButtonInput onClick={onInvert} onTouchStart={onInvert}>
//                     Invert
//                 </ButtonInput>
//                 <ButtonInput onClick={onLeftHand} onTouchStart={onLeftHand}>
//                     {leftHand ? "Right" : "Left"} Hand
//                 </ButtonInput>
//                 <SelectInput
//                     onChange={onLabelChange}
//                     defaultValue={state.label}
//                 >
//                     <option value="sharp">Sharp</option>
//                     <option value="flat">Flat</option>
//                     <option value="value">Value</option>
//                 </SelectInput>
//             </FlexRowCenter>
//             <ArrowControlsContainer>
//                 <FlexRowCenter>
//                     <ButtonArrow
//                         onClick={onArrowPress("ArrowLeft")}
//                         onTouchStart={onArrowPress("ArrowLeft")}
//                     >
//                         &larr;
//                     </ButtonArrow>
//                 </FlexRowCenter>
//                 <ArrowControlsMiddleColumn>
//                     <ButtonArrow
//                         onClick={onArrowPress("ArrowUp")}
//                         onTouchStart={onArrowPress("ArrowUp")}
//                     >
//                         &uarr;
//                     </ButtonArrow>
//                     <ButtonArrow
//                         onClick={onArrowPress("ArrowDown")}
//                         onTouchStart={onArrowPress("ArrowDown")}
//                     >
//                         &darr;
//                     </ButtonArrow>
//                 </ArrowControlsMiddleColumn>
//                 <FlexRowCenter>
//                     <ButtonArrow
//                         onClick={onArrowPress("ArrowRight")}
//                         onTouchStart={onArrowPress("ArrowRight")}
//                     >
//                         &rarr;
//                     </ButtonArrow>
//                 </FlexRowCenter>
//             </ArrowControlsContainer>
//             {/* <TextContainer>
// 				Click to set a note. Right click or Shift + click to highlight a
// 				pattern. Arrow keys Up/Down/Left/Right to move pattern.
// 			</TextContainer> */}
//         </ButtonBank>
//     );
// };

interface ButtonProps {
    activeColor?: string;
    backgroundColor?: string;
    highlighted?: boolean;
    imageSrc?: string;
    border?: string;
    onClick?: (event: MouseEvent | TouchEvent) => void;
}

export const CircleButton: React.FC<ButtonProps> = ({
    activeColor,
    backgroundColor,
    border,
    onClick,
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
        <Circle
            onTouchStart={onMouseDown}
            onMouseDown={onMouseDown}
            backgroundColor={backgroundColor}
            border={border}
            active={active}
            activeColor={activeColor}
        >
            {children}
        </Circle>
    );
};

export const HighlightButton: React.FC<ButtonProps> = ({
    highlighted,
    onClick,
}) => {
    const backgroundColor = primaryColor;
    const activeColor = primaryColor;
    const border = highlighted ? "1px solid #333" : "1px solid transparent";

    return (
        <CircleButton
            backgroundColor={backgroundColor}
            border={border}
            activeColor={activeColor}
            onClick={onClick}
        />
    );
};

export const CircleIconButton: React.FC<ButtonProps> = ({
    imageSrc,
    onClick,
}) => {
    return (
        <CircleButton
            backgroundColor="transparent"
            border="1px solid #000"
            activeColor="#000"
            onClick={onClick}
        >
            {imageSrc && <img src={imageSrc} width="20px" height="20px" />}
        </CircleButton>
    );
};

export const BottomControls: React.FC<Props> = ({ store }) => {
    const [state, setState] = useStore(store);
    const invertRef = useRef(state.invert);
    const leftHandRef = useRef(state.leftHand);

    useEffect(() => {
        store.addListener((newState) => {
            if (newState.invert !== invertRef.current)
                invertRef.current = newState.invert;
            if (newState.leftHand !== leftHandRef.current)
                leftHandRef.current = newState.leftHand;
        });
    }, []);

    const onArrowPress = (direction: ArrowTypes) => () => {
        const actionType = getPositionActionType(
            invertRef.current,
            leftHandRef.current,
            direction
        );

        if (actionType) {
            store.dispatch({ type: actionType });
        }
    };

    return (
        <CircleControlsContainer>
            <div>
                <CircleIconButton
                    onClick={() => store.dispatch({ type: "ADD_FRETBOARD" })} // maybe preventDefault
                    imageSrc={PlusIcon}
                />
                <Label>{""}</Label>
            </div>
            <div>
                <CircleIconButton
                    onClick={() => store.dispatch({ type: "REMOVE_FRETBOARD" })}
                    imageSrc={MinusIcon}
                />
                <Label>{""}</Label>
            </div>
            <div>
                <CircleIconButton
                    onClick={onArrowPress("ArrowLeft")}
                    imageSrc={LeftIcon}
                />
                <Label>{""}</Label>
            </div>
            <div>
                <CircleIconButton
                    onClick={onArrowPress("ArrowDown")}
                    imageSrc={DownIcon}
                />
                <Label>{""}</Label>
            </div>
            <div>
                <CircleIconButton
                    onClick={onArrowPress("ArrowUp")}
                    imageSrc={UpIcon}
                />
                <Label>{""}</Label>
            </div>
            <div>
                <CircleIconButton
                    onClick={onArrowPress("ArrowRight")}
                    imageSrc={RightIcon}
                />
                <Label>{""}</Label>
            </div>
        </CircleControlsContainer>
    );
};

export const TopControls: React.FC<Props> = ({ store }) => {
    const [focusedIndex, focusedIndexRef, setFocusedIndex] = useStateRef(
        store,
        "focusedIndex"
    );
    const [brushMode, brushModeRef, setBrushMode] = useStateRef(
        store,
        "brushMode"
    );

    const onClick = () => {
        if (brushModeRef.current === "highlight") {
            store.setKey("brushMode", "select");
        } else {
            store.setKey("brushMode", "highlight");
        }
    };

    return (
        <CircleControlsContainer>
            <div>
                <CircleIconButton
                    onClick={() =>
                        store.dispatch({
                            type: "CLEAR",
                            payload: { focusedIndex },
                        })
                    }
                    imageSrc={ClearIcon}
                />
                <Label>{""}</Label>
            </div>
            <div>
                <HighlightButton
                    highlighted={brushMode === "highlight"}
                    onClick={onClick}
                />
                <Label>{brushMode === "highlight" && "highlight"}</Label>
            </div>
        </CircleControlsContainer>
    );
};
