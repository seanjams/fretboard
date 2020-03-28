import * as React from "react";
import styled from "styled-components";
import { FretboardContext } from "../store";
import { Fret } from "./fret";

// CSS
interface CSSProps {}

const StringDiv = styled.div<CSSProps>`
	display: flex;
	width: 100%;
`;

// Component
interface Props {
	base: number;
	highlighted: number[];
}

export const String: React.FC<Props> = ({ base, highlighted }) => {
	const { state } = React.useContext(FretboardContext);

	return (
		<StringDiv>
			{Array(state.stringSize)
				.fill(0)
				.map((_, i) => {
					return (
						<Fret
							value={base + i}
							openString={i === 0}
							active={highlighted.includes(base + i)}
							key={`fret-${base + i}`}
						/>
					);
				})}
		</StringDiv>
	);
};
