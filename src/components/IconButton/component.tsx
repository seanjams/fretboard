import React, { useRef, useState } from "react";
import { useTouchHandlers } from "../../store";
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
    const [active, setActive] = useState(selected || false);
    const activeRef = useRef(active);
    activeRef.current = active;

    const touchHandlers = useTouchHandlers({
        onStart: (event: ReactMouseEvent) => {
            if (!activeRef.current) setActive(true);
        },
        onClick: (event: WindowMouseEvent) => {
            if (onClick) onClick(event);
        },
        onEnd: (event: WindowMouseEvent) => {
            if (activeRef.current) setActive(false);
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
