import * as React from "react";
import styled from "styled-components";
import { mod } from "../utils";
import { FRETBOARD_WIDTH, STRING_SIZE } from "../consts";
import { Store, StateType, useStore } from "../store";

// CSS
interface CSSProps {
	width?: number;
}

const StringDiv = styled.div<CSSProps>`
	display: flex;
	width: 100%;
`;

const EmptyDiv = styled.div<CSSProps>`
	height: 20px;
	width: ${({ width }) => width}%;
	display: flex;
	justify-content: center;
	align-items: center;
	margin-left: -2px;
`;

const Dot = styled.div<CSSProps>`
	width: 8px;
	height: 8px;
	border-radius: 100%;
	background-color: #333;
	margin: 10px;
`;

// Component
interface Props {
	top?: boolean;
	store: Store<StateType>;
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
					{i !== 0 && [0, 3, 5, 7, 9].includes(dotIndex) && <Dot />}
					{i !== 0 && dotIndex === 0 && <Dot />}
				</EmptyDiv>
			);
		});

	return <StringDiv>{state.invert ? frets.reverse() : frets}</StringDiv>;
};
