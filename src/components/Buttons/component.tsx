import React, { useRef, useState } from "react";
import { useTouchHandlers } from "../../store";
import { ReactMouseEvent, WindowMouseEvent } from "../../types";
import { lightBlue, lighterGrey, mediumGrey, white } from "../../utils";
import { FlexRow } from "../Common";
import { ButtonDiv } from "./style";

// Icon Button
export interface IconButtonProps {
    onClick?: (event: WindowMouseEvent) => void;
    activeColor?: string;
    activeIconColor?: string;
    backgroundColor?: string;
    buttonHeight?: number;
    buttonWidth?: number;
    iconColor?: string;
    iconHeight?: number;
    iconWidth?: number;
    isCircular?: boolean;
    selected?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
    onClick,
    activeColor,
    activeIconColor,
    backgroundColor,
    buttonHeight,
    buttonWidth,
    iconColor,
    iconHeight,
    iconWidth,
    isCircular,
    selected,
    children,
}) => {
    const [active, setActive] = useState(selected || false);
    const activeRef = useRef(active);
    activeRef.current = active;
    // recommended button height for iOS
    const defaultButtonHeight = 44;

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
            height={`${buttonHeight || defaultButtonHeight}px`}
            width={`${buttonWidth || defaultButtonHeight}px`}
            lineHeight={0}
            backgroundColor={backgroundColor || lighterGrey}
            active={active}
            activeColor={activeColor || lightBlue}
            pressed={selected}
            pressedColor={activeColor || lightBlue}
            iconColor={iconColor || mediumGrey}
            activeIconColor={activeIconColor || white}
            className="button-div"
            iconWidth={iconWidth}
            iconHeight={iconHeight}
            isCircular={isCircular}
        >
            {children}
        </ButtonDiv>
    );
};

// Text Button
export interface TextButtonProps {
    onClick?: (event: WindowMouseEvent) => void;
    activeColor?: string;
    backgroundColor?: string;
    fontSize?: string;
    selected?: boolean;
}

export const TextButton: React.FC<TextButtonProps> = ({
    onClick,
    activeColor,
    backgroundColor,
    fontSize,
    selected,
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
        <FlexRow height="100%" width="100%">
            <ButtonDiv
                {...touchHandlers}
                height="100%"
                width="100%"
                fontSize={fontSize}
                backgroundColor={backgroundColor || lighterGrey}
                active={active}
                activeColor={activeColor || lightBlue}
                pressed={selected}
                pressedColor={activeColor || lightBlue}
                isCircular={false}
            >
                {children}
            </ButtonDiv>
        </FlexRow>
    );
};
