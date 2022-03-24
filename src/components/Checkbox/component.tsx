import React, { useState, useEffect } from "react";
import { useTouchHandlers } from "../../store";
import { ReactMouseEvent } from "../../types";
import { CheckboxAnimation, CheckboxContainer, CheckboxLabel } from "./style";
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

    const touchHandlers = useTouchHandlers({ onStart: onClick });

    return (
        <FlexRow>
            <CheckboxAnimation trigger={isChecked}>
                <CheckboxContainer>
                    <CheckboxLabel isLeft={true}>{leftLabel}</CheckboxLabel>
                    <Div className="checkbox" {...touchHandlers}>
                        <Div />
                    </Div>
                    <CheckboxLabel isLeft={false}>{rightLabel}</CheckboxLabel>
                </CheckboxContainer>
            </CheckboxAnimation>
        </FlexRow>
    );
};
