import React, { useEffect, useLayoutEffect, useRef } from "react";
import { AppStore, useStateRef, useTouchHandlers } from "../../store";
import { ReactMouseEvent, WindowMouseEvent } from "../../types";
import { FlexRow } from "../Common";
import {
    OverflowContainerDiv,
    SelectorContainer,
    SelectorOption,
    ShadowOverlay,
} from "./style";

interface OptionProps {
    selected?: boolean;
    onClick?: (event: ReactMouseEvent | WindowMouseEvent) => void;
    value: string;
}

export const ScrollSelectOption: React.FC<OptionProps> = ({
    children,
    selected,
    onClick,
}) => {
    const touchHandlers = useTouchHandlers({
        onClick: (event) => {
            onClick && onClick(event);
        },
    });

    return (
        <SelectorOption selected={selected} {...touchHandlers}>
            {children}
        </SelectorOption>
    );
};

// Component
interface Props {
    appStore?: AppStore;
    onChange?: (item: any, index: number) => void;
    value: string;
    children?: JSX.Element[];
}

export const ScrollSelect: React.FC<Props> = ({
    appStore,
    children,
    onChange,
    value,
}) => {
    // whether the high E string appears on the top or bottom of the fretboard,
    // depending on invert/leftHand views
    const defaultOptions: JSX.Element[] = [];
    const [getState, setState] = useStateRef(() => ({
        options: defaultOptions,
        selectedIndex: 0,
    }));
    const { options } = getState();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const options: JSX.Element[] = [];
        let selectedIndex = -1;
        if (!children) return;
        React.Children.map(children, (child, i) => {
            const newProps: OptionProps = {
                value: child.props.value,
                onClick: onClickOption(i),
                selected: false,
            };
            // set selected on option with new value, and false for the rest
            if (selectedIndex < 0 && value && value === child.props.value) {
                selectedIndex = i;
                newProps.selected = true;
            }

            options.push(React.cloneElement(child, newProps));
        });
        setState({ options, selectedIndex });
        // let setState process its rerender before scrolling, hence setTimeout
        setTimeout(() => scrollToOption(selectedIndex), 0);
    }, [value]);

    const onClickOption = (i: number) => (event: WindowMouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        onChange && onChange(event, i);
    };

    const scrollToOption = (childIndex: number) => {
        if (!scrollContainerRef.current) return;
        // this is fragile, but should be fine since
        // we define the structure below to always have a first element
        const child = scrollContainerRef.current.children[0].children[
            childIndex
        ] as HTMLElement;
        if (!child) return;

        const halfContainerWidth = scrollContainerRef.current.offsetWidth / 2;
        let newCenter = child.offsetLeft + child.offsetWidth / 2;
        const newLeft = newCenter - halfContainerWidth;

        scrollContainerRef.current.scrollTo({
            top: 0,
            left: newLeft,
            behavior: "smooth",
        });
    };

    return (
        <SelectorContainer>
            <ShadowOverlay className="overflow-container" />
            <OverflowContainerDiv
                className="overflow-container"
                ref={scrollContainerRef}
            >
                <FlexRow width="fit-content" height="100%">
                    {options}
                </FlexRow>
            </OverflowContainerDiv>
        </SelectorContainer>
    );
};
