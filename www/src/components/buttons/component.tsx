import React, { useRef, useEffect, useState, useCallback } from "react";
import { COLORS } from "../../utils";
import { Circle } from "./style";

const [secondaryColor, primaryColor] = COLORS[0];

// Component
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
        // event.preventDefault();
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
