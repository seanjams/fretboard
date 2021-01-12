import * as React from "react";
import styled from "styled-components";
import { mod } from "../utils";
import { FretboardContext } from "../store";

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
	margin-left: 4px;
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
	fretboardIndex: number;
	top?: boolean;
}

export const Legend: React.FC<Props> = ({ fretboardIndex, top }) => {
	const { state } = React.useContext(FretboardContext);

	const frets = Array(state.stringSize)
	.fill(0)
	.map((_, i) => {
		const dotIndex = mod(i, 12);
		const width = (1 + ((12 - i) / 30)) * 8.333333;
		return (
			<EmptyDiv width={width} key={`legend-${fretboardIndex}-${i}-${top ? 1 : 0}`}>
				{i !== 0 && [0, 3, 5, 7, 9].includes(dotIndex) && <Dot />}
				{i !== 0 && dotIndex === 0 && <Dot />}
			</EmptyDiv>
		);
	});

	return <StringDiv>{state.invert ? frets.reverse() : frets}</StringDiv>;
};
