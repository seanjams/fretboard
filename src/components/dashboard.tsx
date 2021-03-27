import * as React from "react";
import styled from "styled-components";
import { FretboardContext } from "../store";
import { Fretboard } from "./fretboard";
import { NavControls, AddFretboardControls } from "./controls";

// CSS
interface CSSProps {}

const ContainerDiv = styled.div<CSSProps>`
	font-family: Arial;
	position: absolute;
	top: 40px;
`;

const FretboardControlsContainerDiv = styled.div<CSSProps>`
	width: 100vw;
	display: flex;
	justify-content: flex-end;
`;

// Component
interface Props {}

export const Dashboard: React.FC<Props> = () => {
	const { state } = React.useContext(FretboardContext);

	return (
		<div>
			<NavControls />
			<ContainerDiv>
				{state.fretboards.map((_, i) => <Fretboard key={`fretboard-${i}`} fretboardIndex={i} />)}
				<FretboardControlsContainerDiv>
					<AddFretboardControls />
				</FretboardControlsContainerDiv>
			</ContainerDiv>
		</div>
	);
};
