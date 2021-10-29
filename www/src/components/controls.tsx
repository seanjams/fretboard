import React, { useRef, useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import { Store } from "../store";
import { ArrowTypes, StateType } from "../types";
import {
    COLORS,
    getCurrentProgression,
    HIGHLIGHTED,
    SELECTED,
    BRUSH_MODES,
} from "../utils";
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
    store: Store<StateType>;
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
                ? store.reducers.decrementPositionY
                : store.reducers.incrementPositionY,
            ArrowDown: highEBottom
                ? store.reducers.incrementPositionY
                : store.reducers.decrementPositionY,
            ArrowRight: invert
                ? store.reducers.decrementPositionX
                : store.reducers.incrementPositionX,
            ArrowLeft: invert
                ? store.reducers.incrementPositionX
                : store.reducers.decrementPositionX,
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
    const [brushMode, setBrushMode] = useState(store.state.brushMode);
    const brushModeRef = useRef(brushMode);
    brushModeRef.current = brushMode;

    useEffect(() => {
        return store.addListener(({ brushMode }) => {
            if (brushMode !== brushModeRef.current) setBrushMode(brushMode);
        });
    }, []);

    const onBrushMode = () => {
        store.reducers.setBrushMode(
            store.state.brushMode === HIGHLIGHTED ? SELECTED : HIGHLIGHTED
        );
    };

    const onClearNotes = () => {
        store.reducers.clear();
    };

    return (
        <CircleControlsContainer>
            <div>
                <CircleIconButton onClick={onClearNotes} imageSrc={ClearIcon} />
                <Label>{""}</Label>
            </div>
            <div>
                <HighlightButton
                    highlighted={brushMode === HIGHLIGHTED}
                    onClick={onBrushMode}
                />
                <Label>
                    {brushMode === HIGHLIGHTED && BRUSH_MODES[HIGHLIGHTED]}
                </Label>
            </div>
        </CircleControlsContainer>
    );
};

export const SliderControls: React.FC<Props> = ({ store }) => {
    const onAddFretboard = () => store.reducers.addFretboard();
    const onRemoveFretboard = () => store.reducers.removeFretboard();

    return (
        <CircleControlsContainer>
            <div>
                <CircleIconButton
                    onClick={onAddFretboard}
                    imageSrc={PlusIcon}
                />
                <Label>{""}</Label>
            </div>
            <div>
                <CircleIconButton
                    onClick={onRemoveFretboard}
                    imageSrc={MinusIcon}
                />
                <Label>{""}</Label>
            </div>
        </CircleControlsContainer>
    );
};
