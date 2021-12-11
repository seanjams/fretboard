import React, { useRef, useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import { AnyReducersType, Store, useStateRef, StateType } from "../store";
import { ArrowTypes } from "../types";
import { COLORS, HIGHLIGHTED, SELECTED, BRUSH_MODES } from "../utils";
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

const CircleControlsContainer = styled.div<CSSProps>`
    display: flex;
    align-items: center;
    justify-content: start;
    width: 100%;
`;

const Circle = styled.div.attrs((props: CSSProps) => ({
    style: {
        backgroundColor: props.active
            ? props.activeColor
            : props.backgroundColor,
        border: props.border,
    },
}))<CSSProps>`
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
    store: Store<StateType, AnyReducersType<StateType>>;
}

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

export const PositionControls: React.FC<Props> = ({ store }) => {
    const onArrowPress = (direction: ArrowTypes) => () => {
        const { invert, leftHand } = store.state;

        // Get the action direction based on orientation of fretboard
        // could maybe move this to reducer.
        // highEBottom
        // 	- whether the high E string appears on the top or bottom of the fretboard,
        // 	- depending on invert/leftHand views
        const highEBottom = invert !== leftHand;
        const keyMap: { [key in ArrowTypes]: () => StateType } = {
            ArrowUp: highEBottom
                ? store.dispatch.decrementPositionY
                : store.dispatch.incrementPositionY,
            ArrowDown: highEBottom
                ? store.dispatch.incrementPositionY
                : store.dispatch.decrementPositionY,
            ArrowRight: invert
                ? store.dispatch.decrementPositionX
                : store.dispatch.incrementPositionX,
            ArrowLeft: invert
                ? store.dispatch.incrementPositionX
                : store.dispatch.decrementPositionX,
        };
        if (keyMap[direction]) keyMap[direction]();
    };

    return (
        <CircleControlsContainer>
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

export const HighlightControls: React.FC<Props> = ({ store }) => {
    const [getState, setState] = useStateRef({
        status: store.state.status,
    });
    const { status } = getState();

    useEffect(() => {
        return store.addListener(({ status }) => {
            if (getState().status !== status)
                setState((prevState) => ({
                    ...prevState,
                    status,
                }));
        });
    }, []);

    const onStatusChange = () => {
        const { status } = getState();
        store.dispatch.setStatus(
            status === HIGHLIGHTED ? SELECTED : HIGHLIGHTED
        );
    };

    const onClearNotes = () => {
        store.dispatch.clear();
    };

    return (
        <CircleControlsContainer>
            <div>
                <CircleIconButton onClick={onClearNotes} imageSrc={ClearIcon} />
                <Label>{""}</Label>
            </div>
            <div>
                <HighlightButton
                    highlighted={status === HIGHLIGHTED}
                    onClick={onStatusChange}
                />
                <Label>
                    {status === HIGHLIGHTED && BRUSH_MODES[HIGHLIGHTED]}
                </Label>
            </div>
        </CircleControlsContainer>
    );
};

export const SliderControls: React.FC<Props> = ({ store }) => {
    return (
        <CircleControlsContainer>
            <div>
                <CircleIconButton
                    onClick={store.dispatch.addFretboard}
                    imageSrc={PlusIcon}
                />
                <Label>{""}</Label>
            </div>
            <div>
                <CircleIconButton
                    onClick={store.dispatch.removeFretboard}
                    imageSrc={MinusIcon}
                />
                <Label>{""}</Label>
            </div>
        </CircleControlsContainer>
    );
};
