import * as React from "react";
import styled from "styled-components";
import { FretboardContext } from "../store";
import { Fretboard } from "./fretboard";
import { Controls } from "./controls";

// CSS
interface CSSProps {}

const ContainerDiv = styled.div<CSSProps>`
	font-family: Arial;
	position: absolute;
	top: 40px;
`;

// Component
interface Props {}

export const Dashboard: React.FC<Props> = () => {
	const { state } = React.useContext(FretboardContext);

	return (
		<div>
			<Controls />
			<ContainerDiv>
				{state.fretboards.map((_, i) => <Fretboard key={`fretboard-${i}`} fretboardIndex={i} />)}
			</ContainerDiv>
		</div>
	);
};
