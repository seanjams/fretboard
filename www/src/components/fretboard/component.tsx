import React, { useEffect } from "react";
import { useStateRef, AppStore, SliderStore, AudioStore } from "../../store";
import { GuitarString } from "../string";
import { STANDARD_TUNING, FRETBOARD_WIDTH } from "../../utils";
import { FretboardContainer, FretboardDiv } from "./style";

// Component
interface Props {
    store: AppStore;
    sliderStore: SliderStore;
    audioStore: AudioStore;
}

export const Fretboard: React.FC<Props> = ({
    store,
    sliderStore,
    audioStore,
}) => {
    // whether the high E string appears on the top or bottom of the fretboard,
    // depending on invert/leftHand views
    const [getState, setState] = useStateRef(() => ({
        highEBottom: store.state.invert !== store.state.leftHand,
    }));
    const { highEBottom } = getState();

    useEffect(() => {
        return store.addListener(({ invert, leftHand }) => {
            const highEBottom = invert !== leftHand;
            if (getState().highEBottom !== highEBottom)
                setState({ highEBottom });
        });
    }, []);

    const strings = STANDARD_TUNING.map((value, i) => (
        <GuitarString
            stringIndex={i}
            base={value}
            key={`string-${i}`}
            store={store}
            sliderStore={sliderStore}
            audioStore={audioStore}
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
