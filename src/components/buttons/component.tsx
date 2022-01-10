import React, { useRef, useEffect, useState, useCallback } from "react";
import { useStateRef } from "../../store";
import { COLORS, darkGrey } from "../../utils";
import { Circle } from "./style";

const [secondaryColor, primaryColor] = COLORS[0];

// Component
interface ButtonProps {
    activeColor?: string;
    backgroundColor?: string;
    border?: string;
    diameter?: number;
    onClick?: (event: MouseEvent | TouchEvent) => void;
}

export const CircleButton: React.FC<ButtonProps> = ({
    activeColor,
    backgroundColor,
    diameter,
    onClick,
    children,
}) => {
    const [getState, setState] = useStateRef(() => ({
        active: false,
    }));
    const { active } = getState();

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
        // event.preventDefault();
        if (!getState().active) setState({ active: true });
    };

    const onMouseUp = useCallback((event: MouseEvent | TouchEvent) => {
        event.stopPropagation();

        if (getState().active) {
            setState({ active: false });
            if (onClick) onClick(event);
        }
    }, []);

    return (
        <Circle
            onTouchStart={onMouseDown}
            onMouseDown={onMouseDown}
            backgroundColor={backgroundColor}
            active={active}
            activeColor={activeColor}
            diameter={diameter}
            className="circle-button"
        >
            {children}
        </Circle>
    );
};

export interface HighlightButtonProps {
    onClick?: (event: MouseEvent | TouchEvent) => void;
}

export const HighlightButton: React.FC<HighlightButtonProps> = ({
    onClick,
}) => {
    const backgroundColor = primaryColor;
    const activeColor = primaryColor;

    return (
        <CircleButton
            backgroundColor={backgroundColor}
            activeColor={activeColor}
            onClick={onClick}
            diameter={44}
        />
    );
};

export interface CircleButtonProps {
    imageSrc?: string;
    onClick?: (event: MouseEvent | TouchEvent) => void;
}

export const CircleIconButton: React.FC<CircleButtonProps> = ({
    imageSrc,
    onClick,
}) => {
    return (
        <CircleButton
            backgroundColor="transparent"
            activeColor={darkGrey}
            onClick={onClick}
            diameter={44}
        >
            {imageSrc && <img src={imageSrc} width="20px" height="20px" />}
        </CircleButton>
    );
};
