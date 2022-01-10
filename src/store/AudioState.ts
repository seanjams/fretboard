import { Howl, Howler } from "howler";
import { StringSwitchType } from "../types";
import {
    STANDARD_TUNING,
    mod,
    FLAT_NAMES,
    STRING_SIZE,
    HIGHLIGHTED,
} from "../utils";
import { Store } from "./store";

import WebWorker from "../webworkers/WebWorker";
import timerWorkerCode from "../webworkers/metronomeworker";

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

const VOLUME = 0.1;

// Types
export interface AudioStateType {
    stringSounds: Howl[];
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
        console.log(isMuted);
        for (let sound of state.stringSounds) {
            sound.volume(isMuted ? 0 : VOLUME);
        }
        return { ...state, isMuted };
    },
};

// Store
export class AudioStore extends Store<AudioStateType, typeof audioReducers> {
    constructor() {
        super(DEFAULT_AUDIO_STATE(), audioReducers);
    }

    timerWorker: Worker = WebWorker(timerWorkerCode);

    playNote(stringIndex: number, fretIndex: number) {
        // play sound for note at stringIndex, fretIndex
        const noteName =
            FLAT_NAMES[mod(STANDARD_TUNING[stringIndex] + fretIndex, 12)];
        const fretKey = `${stringIndex}_${fretIndex}_${noteName.replace(
            "♭",
            "b"
        )}`;
        const stringSound = this.state.stringSounds[stringIndex];

        if (stringSound) {
            // stringSound.pause();
            const fretName = `${stringIndex}_${fretIndex}`;
            this.dispatch.clearIsPlaying();
            this.dispatch.setIsPlaying(fretName, true);
            const soundId = stringSound.play(fretKey);
            stringSound.on(
                "end",
                (e) => {
                    this.dispatch.setIsPlaying(fretName, false);
                },
                soundId
            );
        }
    }

    playNotes(sounds: [number, number][], interval: number) {
        // start a worker to play each note at [stringIndex, fretIndex]
        // in "sounds", every "interval" milliseconds
        this.state.stringSounds.forEach((sound) => sound.stop());
        this.dispatch.clearIsPlaying();
        this.timerWorker.postMessage("stop");

        if (sounds.length) {
            // what to do when we get ticks
            this.timerWorker.onmessage = (e) => {
                if (e.data == "tick") {
                    // console.log("tick!");
                    const [stringIndex, fretIndex] = sounds[0];
                    this.playNote(stringIndex, fretIndex);
                    sounds.splice(0, 1);
                    if (!sounds.length) this.timerWorker.postMessage("stop");
                } else console.log("message: " + e.data);
            };

            // set the speed and start the ticks
            this.timerWorker.postMessage({ interval });
            this.timerWorker.postMessage("start");
        }
    }

    strumChord(fretboard: StringSwitchType) {
        // figure out which notes are highlighted on each string
        // get the rightmost value
        // play chord with very small delay between notes
        let strumSounds: [number, number][] = [];

        for (let stringIndex in fretboard) {
            let fretIndex = -1;
            let fretString = fretboard[stringIndex];
            for (let i = 0; i < STRING_SIZE; i++) {
                let fretValue = fretString[i + STANDARD_TUNING[stringIndex]];
                if (fretValue === HIGHLIGHTED) fretIndex = i;
            }
            if (fretIndex >= 0) strumSounds.push([+stringIndex, fretIndex]);
        }

        const strumDelay = 70;
        this.playNotes(strumSounds, strumDelay);
    }

    arpeggiateChord(fretboard: StringSwitchType) {
        // figure out which notes are highlighted on each string
        // construct notes to be played forward and backwards
        // play chord with medium delay between notes
        let arpeggiateSounds: [number, number][] = [];

        for (let stringIndex in fretboard) {
            let fretString = fretboard[stringIndex];
            for (let i = 0; i < STRING_SIZE; i++) {
                let fretValue = fretString[i + STANDARD_TUNING[stringIndex]];
                if (fretValue === HIGHLIGHTED)
                    arpeggiateSounds.push([+stringIndex, i]);
            }
        }

        arpeggiateSounds = arpeggiateSounds.concat(
            arpeggiateSounds.slice(0, -1).reverse()
        );

        const arpeggiateDelay = 250;
        this.playNotes(arpeggiateSounds, arpeggiateDelay);
    }
}

// Default State

export function DEFAULT_AUDIO_STATE(): AudioStateType {
    const stringJson = {
        String_0_E,
        String_1_A,
        String_2_D,
        String_3_G,
        String_4_B,
        String_5_E,
    };

    const soundUrls: {
        [key in keyof typeof stringJson]: [string, string];
    } = {
        String_0_E: [SOUND_STRING_0_E_OGG, SOUND_STRING_0_E_MP3],
        String_1_A: [SOUND_STRING_1_A_OGG, SOUND_STRING_1_A_MP3],
        String_2_D: [SOUND_STRING_2_D_OGG, SOUND_STRING_2_D_MP3],
        String_3_G: [SOUND_STRING_3_G_OGG, SOUND_STRING_3_G_MP3],
        String_4_B: [SOUND_STRING_4_B_OGG, SOUND_STRING_4_B_MP3],
        String_5_E: [SOUND_STRING_5_E_OGG, SOUND_STRING_5_E_MP3],
    };

    function createHowl(name: keyof typeof stringJson): Howl {
        const sprite = stringJson[name].sprite as {
            [name: string]: [number, number];
        };
        const urls = soundUrls[name];

        return new Howl({
            src: urls,
            autoplay: false,
            loop: false,
            volume: VOLUME,
            preload: true,
            sprite: sprite,
            // onplay: function () {
            //     console.log("Playing!", name);
            // },
            // onplayerror: function (e, code) {
            //     console.log("Play Error", name, e, code);
            // },
            // onend: function () {
            //     console.log("Finished!", name);
            // },
            // onload: function () {
            //     console.log("Loaded!", name);
            // },
            // onloaderror: function (e, code) {
            //     console.log("Load Error", name, e, code);
            // },
        });
    }

    return {
        stringSounds: [
            createHowl("String_0_E"),
            createHowl("String_1_A"),
            createHowl("String_2_D"),
            createHowl("String_3_G"),
            createHowl("String_4_B"),
            createHowl("String_5_E"),
        ],
        isLoaded: false,
        isPlaying: new Set(),
        isMuted: false,
    };
}
