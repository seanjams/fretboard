import React from "react";
import { useStateRef, useTouchHandlers } from "../../store";
import { ReactMouseEvent, WindowMouseEvent } from "../../types";
import { darkGrey } from "../../utils";
import { ButtonDiv } from "./style";

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
            backgroundColor="transparent"
            active={active}
            pressed={selected}
            activeColor={darkGrey}
            diameter={44}
            className="button-div"
            iconWidth={iconWidth}
            iconHeight={iconHeight}
            isCircular={isCircular}
        >
            {imageSrc && <img src={imageSrc} width="20px" height="20px" />}
        </ButtonDiv>
    );
};
