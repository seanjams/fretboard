import * as React from "react";
import styled from "styled-components";
import { StateType, Store } from "../store";
import { Fretboard } from "./fretboard";
import { NavControls } from "./controls";
import { Slider } from "./slider";

// CSS
interface CSSProps {}

const ContainerDiv = styled.div<CSSProps>`
	width: 100vw;
	overflow-x: auto;
	font-family: Arial;
`;

// Component
interface Props {
	store: Store<StateType>;
}

export const Dashboard: React.FC<Props> = ({ store }) => (
	<div>
		<ContainerDiv>
			<NavControls store={store} />
		</ContainerDiv>
		<ContainerDiv>
			<Fretboard store={store} />
		</ContainerDiv>
		<ContainerDiv>
			<Slider store={store} />
		</ContainerDiv>
	</div>
);
