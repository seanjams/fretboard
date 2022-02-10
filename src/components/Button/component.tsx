import React from "react";
import { useStateRef, useTouchHandlers } from "../../store";
import { ReactMouseEvent, WindowMouseEvent } from "../../types";
import { COLORS, darkGrey } from "../../utils";
import { Circle } from "./style";

const [secondaryColor, primaryColor] = COLORS[0];

// Component
interface ButtonProps {
    activeColor?: string;
    backgroundColor?: string;
    border?: string;
    diameter?: number;
    onClick?: (event: WindowMouseEvent) => void;
    selected?: boolean;
}

export const CircleButton: React.FC<ButtonProps> = ({
    activeColor,
    backgroundColor,
    diameter,
    onClick,
    children,
    selected,
}) => {
    const [getState, setState] = useStateRef(() => ({
        active: selected || false,
    }));
    const { active } = getState();

    const touchHandlers = useTouchHandlers(
        (event: ReactMouseEvent) => {
            if (!getState().active) setState({ active: true });
        },
        (event: WindowMouseEvent) => {
            if (getState().active) setState({ active: false });

            if (onClick) onClick(event);
        }
    );

    return (
        <Circle
            {...touchHandlers}
            backgroundColor={backgroundColor}
            active={active}
            pressed={selected}
            activeColor={activeColor}
            diameter={diameter}
            className="circle-button"
        >
            {children}
        </Circle>
    );
};

export interface HighlightButtonProps {
    onClick?: (event: WindowMouseEvent) => void;
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
    onClick?: (event: WindowMouseEvent) => void;
    selected?: boolean;
}

export const CircleIconButton: React.FC<CircleButtonProps> = ({
    imageSrc,
    onClick,
    selected,
}) => {
    return (
        <CircleButton
            backgroundColor="transparent"
            activeColor={darkGrey}
            onClick={onClick}
            diameter={44}
            selected={selected}
        >
            {imageSrc && <img src={imageSrc} width="20px" height="20px" />}
        </CircleButton>
    );
};
