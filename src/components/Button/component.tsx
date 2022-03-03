import React from "react";
import { useStateRef, useTouchHandlers } from "../../store";
import { ReactMouseEvent, WindowMouseEvent } from "../../types";
import { COLORS, darkGrey } from "../../utils";
import { ButtonDiv } from "./style";

const [secondaryColor, primaryColor] = COLORS[0];

// Component
interface ButtonProps {
    activeColor?: string;
    backgroundColor?: string;
    border?: string;
    diameter?: number;
    onClick?: (event: WindowMouseEvent) => void;
    selected?: boolean;
    iconHeight?: number;
    iconWidth?: number;
    isCircular?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    activeColor,
    backgroundColor,
    diameter,
    onClick,
    children,
    selected,
    iconWidth,
    iconHeight,
    isCircular,
}) => {
    const [getState, setState] = useStateRef(() => ({
        active: selected || false,
    }));
    const { active } = getState();

    const touchHandlers = useTouchHandlers({
        onStart: (event: ReactMouseEvent) => {
            if (!getState().active) setState({ active: true });
        },
        onEnd: (event: WindowMouseEvent) => {
            if (getState().active) setState({ active: false });

            if (onClick) onClick(event);
        },
    });

    return (
        <ButtonDiv
            {...touchHandlers}
            backgroundColor={backgroundColor}
            active={active}
            pressed={selected}
            activeColor={activeColor}
            diameter={diameter}
            className="button-div"
            iconWidth={iconWidth}
            iconHeight={iconHeight}
            isCircular={isCircular}
        >
            {children}
        </ButtonDiv>
    );
};

export interface IconButtonProps {
    imageSrc?: string;
    onClick?: (event: WindowMouseEvent) => void;
    selected?: boolean;
    iconHeight?: number;
    iconWidth?: number;
    isCircular?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
    imageSrc,
    onClick,
    selected,
    iconHeight,
    iconWidth,
    isCircular,
}) => {
    return (
        <Button
            backgroundColor="transparent"
            activeColor={darkGrey}
            onClick={onClick}
            diameter={44}
            selected={selected}
            iconHeight={iconHeight}
            iconWidth={iconWidth}
            isCircular={isCircular}
        >
            {imageSrc && <img src={imageSrc} width="20px" height="20px" />}
        </Button>
    );
};
