import * as React from "react";
import styled from "styled-components";
import { mod, FRETBOARD_WIDTH, STRING_SIZE, LEGEND_HEIGHT } from "../utils";
import { Store, StateType, useStore, ActionTypes } from "../store";

// CSS
interface CSSProps {
    top?: boolean;
    width?: number;
}

const StringDiv = styled.div<CSSProps>`
    display: flex;
    width: 100%;
`;

const EmptyDiv = styled.div<CSSProps>`
    width: ${({ width }) => width}%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: -2px;
`;

const Dot = styled.div.attrs((props: CSSProps) => ({
    style: {
        marginTop: props.top ? "2px" : `${LEGEND_HEIGHT / 2 - 2}px`,
        marginRight: `${LEGEND_HEIGHT / 2}px`,
        marginBottom: props.top ? `${LEGEND_HEIGHT / 2 - 2}px` : "2px",
        marginLeft: `${LEGEND_HEIGHT / 2}px`,
    },
}))<CSSProps>`
    width: ${LEGEND_HEIGHT / 2}px;
    height: ${LEGEND_HEIGHT / 2}px;
    border-radius: 100%;
    background-color: #333;
`;

// Component
interface Props {
    top?: boolean;
    store: Store<StateType, ActionTypes>;
}

export const Legend: React.FC<Props> = ({ top, store }) => {
    const [state, setState] = useStore(store);

    const frets = Array(state.stringSize)
        .fill(0)
        .map((_, i) => {
            const dotIndex = mod(i, 12);

            // const width = (1 + ((12 - i) / 30)) * 8.333333;
            const width = FRETBOARD_WIDTH / STRING_SIZE;
            return (
                <EmptyDiv width={width} key={`legend-${i}-${top ? 1 : 0}`}>
                    {i !== 0 && [0, 3, 5, 7, 9].includes(dotIndex) && (
                        <Dot top={top} />
                    )}
                    {i !== 0 && dotIndex === 0 && <Dot top={top} />}
                </EmptyDiv>
            );
        });

    return <StringDiv>{state.invert ? frets.reverse() : frets}</StringDiv>;
};
