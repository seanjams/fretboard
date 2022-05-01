import { FretboardType } from "../types";
import { STANDARD_TUNING, mod, FLAT_NAMES, HIGHLIGHTED } from "../utils";
import { Store } from "./store";
import * as Tone from "tone";

import String_0_E from "../assets/audio/String_0_E.json";
import String_1_A from "../assets/audio/String_1_A.json";
import String_2_D from "../assets/audio/String_2_D.json";
import String_3_G from "../assets/audio/String_3_G.json";
import String_4_B from "../assets/audio/String_4_B.json";
import String_5_E from "../assets/audio/String_5_E.json";

import SOUND_STRING_0_E_OGG from "../assets/audio/String_0_E.ogg";
import SOUND_STRING_0_E_MP3 from "../assets/audio/String_0_E.mp3";
import SOUND_STRING_1_A_OGG from "../assets/audio/String_1_A.ogg";
import SOUND_STRING_1_A_MP3 from "../assets/audio/String_1_A.mp3";
import SOUND_STRING_2_D_OGG from "../assets/audio/String_2_D.ogg";
import SOUND_STRING_2_D_MP3 from "../assets/audio/String_2_D.mp3";
import SOUND_STRING_3_G_OGG from "../assets/audio/String_3_G.ogg";
import SOUND_STRING_3_G_MP3 from "../assets/audio/String_3_G.mp3";
import SOUND_STRING_4_B_OGG from "../assets/audio/String_4_B.ogg";
import SOUND_STRING_4_B_MP3 from "../assets/audio/String_4_B.mp3";
import SOUND_STRING_5_E_OGG from "../assets/audio/String_5_E.ogg";
import SOUND_STRING_5_E_MP3 from "../assets/audio/String_5_E.mp3";
import { PatternName } from "tone/build/esm/event/PatternGenerator";

export interface AudioStateType {
    poolSize: number;
    players: Tone.Players;
    isLoaded: boolean;
    isPlaying: Set<any>;
    isMuted: boolean;
}

export function DEFAULT_AUDIO_STATE(
    onLoad?: () => void,
    onError?: (error: Error) => void
): AudioStateType {
    Tone.start();
    const players = new Tone.Players({
        // should contain <poolSize> sets
        urls: {
            // set of players
            0: `[${SOUND_STRING_0_E_OGG}|${SOUND_STRING_0_E_MP3}]`,
            1: `[${SOUND_STRING_1_A_OGG}|${SOUND_STRING_1_A_MP3}]`,
            2: `[${SOUND_STRING_2_D_OGG}|${SOUND_STRING_2_D_MP3}]`,
            3: `[${SOUND_STRING_3_G_OGG}|${SOUND_STRING_3_G_MP3}]`,
            4: `[${SOUND_STRING_4_B_OGG}|${SOUND_STRING_4_B_MP3}]`,
            5: `[${SOUND_STRING_5_E_OGG}|${SOUND_STRING_5_E_MP3}]`,
            // set of players
            6: `[${SOUND_STRING_0_E_OGG}|${SOUND_STRING_0_E_MP3}]`,
            7: `[${SOUND_STRING_1_A_OGG}|${SOUND_STRING_1_A_MP3}]`,
            8: `[${SOUND_STRING_2_D_OGG}|${SOUND_STRING_2_D_MP3}]`,
            9: `[${SOUND_STRING_3_G_OGG}|${SOUND_STRING_3_G_MP3}]`,
            10: `[${SOUND_STRING_4_B_OGG}|${SOUND_STRING_4_B_MP3}]`,
            11: `[${SOUND_STRING_5_E_OGG}|${SOUND_STRING_5_E_MP3}]`,
            // set of players
            12: `[${SOUND_STRING_0_E_OGG}|${SOUND_STRING_0_E_MP3}]`,
            13: `[${SOUND_STRING_1_A_OGG}|${SOUND_STRING_1_A_MP3}]`,
            14: `[${SOUND_STRING_2_D_OGG}|${SOUND_STRING_2_D_MP3}]`,
            15: `[${SOUND_STRING_3_G_OGG}|${SOUND_STRING_3_G_MP3}]`,
            16: `[${SOUND_STRING_4_B_OGG}|${SOUND_STRING_4_B_MP3}]`,
            17: `[${SOUND_STRING_5_E_OGG}|${SOUND_STRING_5_E_MP3}]`,
            // set of players
            18: `[${SOUND_STRING_0_E_OGG}|${SOUND_STRING_0_E_MP3}]`,
            19: `[${SOUND_STRING_1_A_OGG}|${SOUND_STRING_1_A_MP3}]`,
            20: `[${SOUND_STRING_2_D_OGG}|${SOUND_STRING_2_D_MP3}]`,
            21: `[${SOUND_STRING_3_G_OGG}|${SOUND_STRING_3_G_MP3}]`,
            22: `[${SOUND_STRING_4_B_OGG}|${SOUND_STRING_4_B_MP3}]`,
            23: `[${SOUND_STRING_5_E_OGG}|${SOUND_STRING_5_E_MP3}]`,
            // set of players
            24: `[${SOUND_STRING_0_E_OGG}|${SOUND_STRING_0_E_MP3}]`,
            25: `[${SOUND_STRING_1_A_OGG}|${SOUND_STRING_1_A_MP3}]`,
            26: `[${SOUND_STRING_2_D_OGG}|${SOUND_STRING_2_D_MP3}]`,
            27: `[${SOUND_STRING_3_G_OGG}|${SOUND_STRING_3_G_MP3}]`,
            28: `[${SOUND_STRING_4_B_OGG}|${SOUND_STRING_4_B_MP3}]`,
            29: `[${SOUND_STRING_5_E_OGG}|${SOUND_STRING_5_E_MP3}]`,
            // set of players
            30: `[${SOUND_STRING_0_E_OGG}|${SOUND_STRING_0_E_MP3}]`,
            31: `[${SOUND_STRING_1_A_OGG}|${SOUND_STRING_1_A_MP3}]`,
            32: `[${SOUND_STRING_2_D_OGG}|${SOUND_STRING_2_D_MP3}]`,
            33: `[${SOUND_STRING_3_G_OGG}|${SOUND_STRING_3_G_MP3}]`,
            34: `[${SOUND_STRING_4_B_OGG}|${SOUND_STRING_4_B_MP3}]`,
            35: `[${SOUND_STRING_5_E_OGG}|${SOUND_STRING_5_E_MP3}]`,
        },
        onload: onLoad,
        onerror: onError,
        // fadeOut: 1,
    }).toDestination();
    players.volume.value = -12;

    return {
        poolSize: 6,
        players,
        isLoaded: false,
        isPlaying: new Set(),
        isMuted: false,
    };
}

// Reducers
export const audioReducers = {
    setIsPlaying(
        state: AudioStateType,
        value: any,
        play: boolean
    ): AudioStateType {
        if (play) {
            state.isPlaying.add(value);
        } else {
            state.isPlaying.delete(value);
        }
        return state;
    },
    clearIsPlaying(state: AudioStateType): AudioStateType {
        return {
            ...state,
            isPlaying: new Set(),
        };
    },
    toggleMute(state: AudioStateType) {
        const isMuted = !state.isMuted;
        state.players.mute = isMuted;
        return { ...state, isMuted };
    },
};

// Store
export class AudioStore extends Store<AudioStateType, typeof audioReducers> {
    constructor(onLoad?: () => void, onError?: (error: Error) => void) {
        super(DEFAULT_AUDIO_STATE(onLoad, onError), audioReducers);
    }

    isPlaying: { [key in number]: boolean } = {};

    audioJson = [
        String_0_E,
        String_1_A,
        String_2_D,
        String_3_G,
        String_4_B,
        String_5_E,
    ];

    getAvailablePlayer(stringIndex: number): [Tone.Player | null, number] {
        // try to get next available player for given stringIndex
        for (let i = 0; i < this.state.poolSize; i++) {
            const playerIndex = stringIndex + i * 6;
            if (this.isPlaying[playerIndex]) continue;
            return [this.state.players.player(playerIndex + ""), playerIndex];
        }
        // return first player if all are unavailable
        return [this.state.players.player(stringIndex + ""), stringIndex];
    }

    stopAll() {
        Tone.Transport.cancel(0);
        if (Tone.context.state !== "running") Tone.context.resume();
        this.state.players.stopAll();
        this.isPlaying = {};
        this.dispatch.clearIsPlaying();
    }

    playNote(stringIndex: number, fretIndex: number) {
        // play sound for note at stringIndex, fretIndex
        if (!this.state.players || !this.state.players.loaded) return;
        if (Tone.context.state !== "running") Tone.context.resume();

        const noteName =
            FLAT_NAMES[mod(STANDARD_TUNING[stringIndex] + fretIndex, 12)];
        const fretKey = `${stringIndex}_${fretIndex}_${noteName.replace(
            "♭",
            "b"
        )}`;

        const [player, playerIndex] = this.getAvailablePlayer(stringIndex);
        if (player && this.audioJson[stringIndex] !== undefined) {
            // clear isPlaying data
            player.stop();
            this.dispatch.clearIsPlaying();
            // play note
            const fretName = `${stringIndex}_${fretIndex}`;
            const sprite = this.audioJson[stringIndex].sprite[fretKey];
            if (sprite) {
                this.dispatch.setIsPlaying(fretName, true);
                this.isPlaying[playerIndex] = true;
                player.onstop = () => {
                    this.dispatch.setIsPlaying(fretName, false);
                    this.isPlaying[playerIndex] = false;
                };
                player.start(0, sprite[0] / 1000, sprite[1] / 1000);
            }
        }
    }

    playNotes(
        sounds: [number, number][],
        interval: number,
        strumType: PatternName = "up"
    ) {
        if (!this.state.players || !this.state.players.loaded) return;
        // play each note at [stringIndex, fretIndex] in "sounds",
        // every "interval" milliseconds
        this.stopAll();

        let i = 0;
        if (sounds.length) {
            const pattern = new Tone.Pattern(
                (time, [stringIndex, fretIndex]) => {
                    // the order of the notes passed in depends on the pattern
                    this.playNote(stringIndex, fretIndex);
                    i++;
                    if (i === sounds.length) pattern.stop();
                },
                sounds,
                strumType
            );
            pattern.interval = interval / 1000;
            pattern.start();
            Tone.Transport.start();
        }
    }

    strumChord(fretboard: FretboardType, forceArpeggiate: boolean = false) {
        // figure out which notes are highlighted on each string
        // get the rightmost value
        // play chord with very small delay between notes
        let strumSounds: [number, number][] = [];
        let shouldArpeggiate = forceArpeggiate;
        let strumDelay = 70;
        for (let stringIndex in fretboard.strings) {
            let fretString = fretboard.strings[stringIndex];
            let stringCount = 0;
            for (let fretIndex in fretString) {
                let fretValue = fretString[fretIndex];
                if (fretValue === HIGHLIGHTED) {
                    strumSounds.push([+stringIndex, +fretIndex]);
                    stringCount++;
                }
            }
            if (stringCount > 1) shouldArpeggiate = true;
        }
        if (shouldArpeggiate) {
            strumSounds = strumSounds.concat(
                strumSounds.slice(0, -1).reverse()
            );
            strumDelay = 275;
        }
        this.playNotes(strumSounds, strumDelay);
    }
}
