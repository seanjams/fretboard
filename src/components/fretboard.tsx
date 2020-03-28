import * as React from "react";
import styled from "styled-components";
import { STANDARD_TUNING } from "../consts";
import { FretboardContext } from "../store";
import { String } from "./string";

// CSS
interface CSSProps {}

const ContainerDiv = styled.div<CSSProps>`
	font-family: Arial;
`;

const FretboardDiv = styled.div<CSSProps>`
	display: flex;
	flex-direction: column;
	width: 2000px;
`;

const ButtonBank = styled.div<CSSProps>`
	display: flex;
	align-items: center;
	font-size: 10px;
`;

const ButtonInput = styled.div<CSSProps>`
	margin: 10px;
	height: 40px;
`;

const NotesPerStringLabel = styled.span<CSSProps>`
	margin-right: 5px;
`;

// Component
interface Props {}

export const Fretboard: React.FC<Props> = () => {
	const { state, dispatch } = React.useContext(FretboardContext);

	function highlightedNotes(): number[][] {
		const start = STANDARD_TUNING[STANDARD_TUNING.length - 1];
		const end = STANDARD_TUNING[0] + state.stringSize;
		let values: number[] = [];
		const result: number[][] = [];
		for (let i = start; i < end; i++) {
			if (state.selectedNotes[i % 12]) {
				values.push(i);
			}
		}

		values.splice(0, state.position);
		for (let j = 0; j < 6; j++) {
			result.unshift(
				values.slice(j * state.notesPerString, (j + 1) * state.notesPerString)
			);
		}

		return result;
	}

	function setNotesPerString(e: React.FormEvent<HTMLInputElement>): void {
		let notesPerString = parseInt(e.currentTarget.value);
		if (e.type === "blur" && (!notesPerString || notesPerString < 0)) {
			notesPerString = 0;
		}

		dispatch({
			type: "SET_NOTES_PER_STRING",
			payload: notesPerString,
		});
	}

	const onKeyPress: (this: Window, e: KeyboardEvent) => any = e => {
		if (e.key === "ArrowRight") {
			e.preventDefault();
			dispatch({ type: "INCREMENT_POSITION" });
		} else if (e.key === "ArrowLeft") {
			e.preventDefault();
			dispatch({ type: "DECREMENT_POSITION" });
		}
	};

	React.useEffect(() => {
		window.addEventListener("keydown", onKeyPress);
		// ✅  compiles
		return () => {
			window.removeEventListener("keydown", onKeyPress);
		};
	});

	return (
		<ContainerDiv>
			<ButtonBank>
				<ButtonInput>
					<button onClick={() => dispatch({ type: "CLEAR" })}>Clear</button>
				</ButtonInput>
				<ButtonInput>
					<button
						onClick={() => dispatch({ type: "SET_LABEL", payload: "sharp" })}
					>
						Sharp
					</button>
				</ButtonInput>
				<ButtonInput>
					<button
						onClick={() => dispatch({ type: "SET_LABEL", payload: "flat" })}
					>
						Flat
					</button>
				</ButtonInput>
				<ButtonInput>
					<button
						onClick={() => dispatch({ type: "SET_LABEL", payload: "value" })}
					>
						Value
					</button>
				</ButtonInput>
				<ButtonInput>
					<button onClick={() => dispatch({ type: "INCREMENT_POSITION" })}>
						&#43;
					</button>
				</ButtonInput>
				<ButtonInput>
					<button onClick={() => dispatch({ type: "DECREMENT_POSITION" })}>
						&minus;
					</button>
				</ButtonInput>
				<ButtonInput>
					<label>
						<NotesPerStringLabel>Notes Per String</NotesPerStringLabel>
						<input
							type="number"
							onChange={setNotesPerString}
							value={state.notesPerString || ""}
							onBlur={setNotesPerString}
						/>
					</label>
				</ButtonInput>
			</ButtonBank>
			<FretboardDiv>
				{STANDARD_TUNING.map((value, i) => {
					return (
						<String
							base={value}
							key={`string-${value}`}
							highlighted={highlightedNotes()[i]}
						/>
					);
				})}
			</FretboardDiv>
		</ContainerDiv>
	);
};
