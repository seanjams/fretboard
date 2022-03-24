// Animation utils

import React from "react";
import { CSSTransition } from "react-transition-group";

interface AnimationWrapperProps {
    trigger?: any;
}

interface AnimationTimeoutProps {
    enter: number;
    exit: number;
}

export function generateAnimationWrapper(
    Wrapper: React.FC,
    timeout: AnimationTimeoutProps,
    className: string
) {
    const AnimationWrapper: React.FC<
        AnimationWrapperProps & { [key in string]: any }
    > = ({ trigger, children, ...props }) => (
        <Wrapper {...props}>
            <CSSTransition
                in={!!trigger}
                timeout={timeout}
                classNames={className}
                // onEnter={() => setShowButton(false)}
                // onExited={() => setShowButton(true)}
            >
                {children}
            </CSSTransition>
        </Wrapper>
    );

    return AnimationWrapper;
}
