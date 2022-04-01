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
    players: Tone.Players;
    isLoaded: boolean;
    isPlaying: Set<any>;
    isMuted: boolean;
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
    constructor() {
        super(DEFAULT_AUDIO_STATE(), audioReducers);
    }

    audioJson = [
        String_0_E,
        String_1_A,
        String_2_D,
        String_3_G,
        String_4_B,
        String_5_E,
    ];

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

        const player = this.state.players.player(stringIndex + "");
        if (player && this.audioJson[stringIndex] !== undefined) {
            // clear isPlaying data
            player.stop();
            this.dispatch.clearIsPlaying();
            // play note
            const fretName = `${stringIndex}_${fretIndex}`;
            const sprite = this.audioJson[stringIndex].sprite[fretKey];
            if (sprite) {
                this.dispatch.setIsPlaying(fretName, true);
                player.onstop = () => {
                    this.dispatch.setIsPlaying(fretName, false);
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
        Tone.Transport.cancel(0);
        if (Tone.context.state !== "running") Tone.context.resume();

        this.state.players.stopAll();
        this.dispatch.clearIsPlaying();

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

    strumChord(fretboard: FretboardType) {
        // figure out which notes are highlighted on each string
        // get the rightmost value
        // play chord with very small delay between notes
        let strumSounds: [number, number][] = [];

        for (let stringIndex in fretboard.strings) {
            let foundFretIndex = -1;
            let fretString = fretboard.strings[stringIndex];
            for (let fretIndex in fretString) {
                let fretValue = fretString[fretIndex];
                if (fretValue === HIGHLIGHTED) foundFretIndex = +fretIndex;
            }
            if (foundFretIndex >= 0)
                strumSounds.push([+stringIndex, foundFretIndex]);
        }

        const strumDelay = 70;
        this.playNotes(strumSounds, strumDelay);
    }

    arpeggiateChord(fretboard: FretboardType) {
        // figure out which notes are highlighted on each string
        // construct notes to be played forward and backwards
        // play chord with medium delay between notes
        let arpeggiateSounds: [number, number][] = [];

        for (let stringIndex in fretboard.strings) {
            let fretString = fretboard.strings[stringIndex];
            for (let fretIndex in fretString) {
                let fretValue = fretString[fretIndex];
                if (fretValue === HIGHLIGHTED)
                    arpeggiateSounds.push([+stringIndex, +fretIndex]);
            }
        }

        arpeggiateSounds = arpeggiateSounds.concat(
            arpeggiateSounds.slice(0, -1).reverse()
        );

        const arpeggiateDelay = 350;
        this.playNotes(arpeggiateSounds, arpeggiateDelay);
    }
}

// Default State
export function DEFAULT_AUDIO_STATE(): AudioStateType {
    Tone.start();
    const players = new Tone.Players({
        urls: {
            0: `[${SOUND_STRING_0_E_OGG}|${SOUND_STRING_0_E_MP3}]`,
            1: `[${SOUND_STRING_1_A_OGG}|${SOUND_STRING_1_A_MP3}]`,
            2: `[${SOUND_STRING_2_D_OGG}|${SOUND_STRING_2_D_MP3}]`,
            3: `[${SOUND_STRING_3_G_OGG}|${SOUND_STRING_3_G_MP3}]`,
            4: `[${SOUND_STRING_4_B_OGG}|${SOUND_STRING_4_B_MP3}]`,
            5: `[${SOUND_STRING_5_E_OGG}|${SOUND_STRING_5_E_MP3}]`,
        },
        onload: function () {
            console.log("Tone.Players Loaded!");
        },
        onerror: function (error) {
            console.log("Tone.Players Error:", error.message);
        },
        // fadeOut: 1,
    }).toDestination();
    players.volume.value = -6;

    return {
        players,
        isLoaded: false,
        isPlaying: new Set(),
        isMuted: false,
    };
}
