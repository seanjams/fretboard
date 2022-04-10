import React from "react";
import { useStateRef, useTouchHandlers } from "../../store";
import { ReactMouseEvent, WindowMouseEvent } from "../../types";
import { lightBlue, lighterGrey } from "../../utils";
import { ButtonDiv } from "./style";

export interface IconButtonProps {
    onClick?: (event: WindowMouseEvent) => void;
    selected?: boolean;
    iconHeight?: number;
    iconWidth?: number;
    isCircular?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
    onClick,
    selected,
    iconHeight,
    iconWidth,
    isCircular,
    children,
}) => {
    const [getState, setState] = useStateRef(() => ({
        active: selected || false,
    }));
    const { active } = getState();

    const touchHandlers = useTouchHandlers({
        onStart: (event: ReactMouseEvent) => {
            if (!getState().active) setState({ active: true });
        },
        onClick: (event: WindowMouseEvent) => {
            if (onClick) onClick(event);
        },
        onEnd: (event: WindowMouseEvent) => {
            if (getState().active) setState({ active: false });
        },
    });

    return (
        <ButtonDiv
            {...touchHandlers}
            backgroundColor={lighterGrey}
            active={active}
            activeColor={lightBlue}
            pressed={selected}
            pressedColor={lightBlue}
            diameter={44}
            className="button-div"
            iconWidth={iconWidth}
            iconHeight={iconHeight}
            isCircular={isCircular}
        >
            {children}
        </ButtonDiv>
    );
};
