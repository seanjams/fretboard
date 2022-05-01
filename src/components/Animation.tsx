// Animation utils

import React from "react";
import { CSSTransition } from "react-transition-group";
import { TransitionChildren } from "react-transition-group/Transition";

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
    > = ({ trigger, children, appear, ...props }) => {
        let wrapped = children as TransitionChildren;
        return (
            <Wrapper {...props}>
                <CSSTransition
                    in={!!trigger}
                    appear={appear || false}
                    timeout={timeout}
                    classNames={className}
                    // onEnter={() => setShowButton(false)}
                    // onExited={() => setShowButton(true)}
                >
                    {wrapped}
                </CSSTransition>
            </Wrapper>
        );
    };
    return AnimationWrapper;
}
