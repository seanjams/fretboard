import React, { useEffect } from "react";
import {
    Store,
    useStateRef,
    StateType,
    SliderStateType,
    AnyReducersType,
} from "../../store";
import { GuitarString } from "../string";
import { STANDARD_TUNING, FRETBOARD_WIDTH } from "../../utils";
import { FretboardContainer, FretboardDiv } from "./style";

// Component
interface Props {
    fretboardHeight: number;
    store: Store<StateType, AnyReducersType<StateType>>;
    sliderStore: Store<SliderStateType, AnyReducersType<SliderStateType>>;
}

export const Fretboard: React.FC<Props> = ({
    fretboardHeight,
    store,
    sliderStore,
}) => {
    // whether the high E string appears on the top or bottom of the fretboard,
    // depending on invert/leftHand views
    const [getState, setState] = useStateRef({
        highEBottom: store.state.invert !== store.state.leftHand,
    });
    const { highEBottom } = getState();

    useEffect(() => {
        return store.addListener(({ invert, leftHand }) => {
            const highEBottom = invert !== leftHand;
            if (getState().highEBottom !== highEBottom)
                setState((prevState) => ({
                    ...prevState,
                    highEBottom,
                }));
        });
    }, []);

    const strings = STANDARD_TUNING.map((value, i) => (
        <GuitarString
            stringIndex={i}
            base={value}
            key={`string-${i}`}
            fretboardHeight={fretboardHeight}
            store={store}
            sliderStore={sliderStore}
        />
    ));

    return (
        <FretboardContainer width={`${FRETBOARD_WIDTH}px`}>
            <FretboardDiv>
                {highEBottom ? strings : strings.reverse()}
            </FretboardDiv>
        </FretboardContainer>
    );
};
