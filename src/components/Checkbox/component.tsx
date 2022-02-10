import React, { useState, useEffect } from "react";
import { CSSTransition } from "react-transition-group";
import { useTouchHandlers } from "../../store";
import { ReactMouseEvent } from "../../types";
import { CheckboxAnimation } from "./style";
import { Div, FlexRow } from "../Common";

export interface CheckboxProps {
    checked: boolean;
    leftLabel: string;
    rightLabel: string;
    onClick: (event: ReactMouseEvent) => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({
    checked,
    leftLabel,
    rightLabel,
    onClick,
}) => {
    const [isChecked, setIsChecked] = useState(false);

    useEffect(() => setIsChecked(checked), [checked]);

    const touchHandlers = useTouchHandlers(onClick);

    return (
        <FlexRow>
            <CheckboxAnimation.wrapper>
                <CSSTransition
                    in={isChecked}
                    timeout={CheckboxAnimation.timeout}
                    classNames="checkbox-slide"
                >
                    <FlexRow className="checkbox-form" alignItems="center">
                        <Div
                            fontSize="10px"
                            paddingRight="6px"
                            paddingLeft="12px"
                            textAlign="right"
                        >
                            {leftLabel}
                        </Div>
                        <Div className="checkbox" {...touchHandlers}>
                            <Div />
                        </Div>
                        <Div
                            fontSize="10px"
                            paddingRight="12px"
                            paddingLeft="6px"
                            textAlign="left"
                        >
                            {rightLabel}
                        </Div>
                    </FlexRow>
                </CSSTransition>
            </CheckboxAnimation.wrapper>
        </FlexRow>
    );
};
