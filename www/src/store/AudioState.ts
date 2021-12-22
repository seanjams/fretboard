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

// ogg sources for default
import SOUND_0_0_E_OGG from "../assets/audio/0_0_E.ogg";
import SOUND_0_1_F_OGG from "../assets/audio/0_1_F.ogg";
import SOUND_0_2_Gb_OGG from "../assets/audio/0_2_Gb.ogg";
import SOUND_0_3_G_OGG from "../assets/audio/0_3_G.ogg";
import SOUND_0_4_Ab_OGG from "../assets/audio/0_4_Ab.ogg";
import SOUND_0_5_A_OGG from "../assets/audio/0_5_A.ogg";
import SOUND_0_6_Bb_OGG from "../assets/audio/0_6_Bb.ogg";
import SOUND_0_7_B_OGG from "../assets/audio/0_7_B.ogg";
import SOUND_0_8_C_OGG from "../assets/audio/0_8_C.ogg";
import SOUND_0_9_Db_OGG from "../assets/audio/0_9_Db.ogg";
import SOUND_0_10_D_OGG from "../assets/audio/0_10_D.ogg";
import SOUND_0_11_Eb_OGG from "../assets/audio/0_11_Eb.ogg";
import SOUND_0_12_E_OGG from "../assets/audio/0_12_E.ogg";
import SOUND_0_13_F_OGG from "../assets/audio/0_13_F.ogg";
import SOUND_0_14_Gb_OGG from "../assets/audio/0_14_Gb.ogg";
import SOUND_0_15_G_OGG from "../assets/audio/0_15_G.ogg";
import SOUND_0_16_Ab_OGG from "../assets/audio/0_16_Ab.ogg";
import SOUND_0_17_A_OGG from "../assets/audio/0_17_A.ogg";
import SOUND_0_18_Bb_OGG from "../assets/audio/0_18_Bb.ogg";
import SOUND_0_19_B_OGG from "../assets/audio/0_19_B.ogg";
import SOUND_0_20_C_OGG from "../assets/audio/0_20_C.ogg";
import SOUND_0_21_Db_OGG from "../assets/audio/0_21_Db.ogg";
import SOUND_0_22_D_OGG from "../assets/audio/0_22_D.ogg";
import SOUND_1_0_A_OGG from "../assets/audio/1_0_A.ogg";
import SOUND_1_1_Bb_OGG from "../assets/audio/1_1_Bb.ogg";
import SOUND_1_2_B_OGG from "../assets/audio/1_2_B.ogg";
import SOUND_1_3_C_OGG from "../assets/audio/1_3_C.ogg";
import SOUND_1_4_Db_OGG from "../assets/audio/1_4_Db.ogg";
import SOUND_1_5_D_OGG from "../assets/audio/1_5_D.ogg";
import SOUND_1_6_Eb_OGG from "../assets/audio/1_6_Eb.ogg";
import SOUND_1_7_E_OGG from "../assets/audio/1_7_E.ogg";
import SOUND_1_8_F_OGG from "../assets/audio/1_8_F.ogg";
import SOUND_1_9_Gb_OGG from "../assets/audio/1_9_Gb.ogg";
import SOUND_1_10_G_OGG from "../assets/audio/1_10_G.ogg";
import SOUND_1_11_Ab_OGG from "../assets/audio/1_11_Ab.ogg";
import SOUND_1_12_A_OGG from "../assets/audio/1_12_A.ogg";
import SOUND_1_13_Bb_OGG from "../assets/audio/1_13_Bb.ogg";
import SOUND_1_14_B_OGG from "../assets/audio/1_14_B.ogg";
import SOUND_1_15_C_OGG from "../assets/audio/1_15_C.ogg";
import SOUND_1_16_Db_OGG from "../assets/audio/1_16_Db.ogg";
import SOUND_1_17_D_OGG from "../assets/audio/1_17_D.ogg";
import SOUND_1_18_Eb_OGG from "../assets/audio/1_18_Eb.ogg";
import SOUND_1_19_E_OGG from "../assets/audio/1_19_E.ogg";
import SOUND_1_20_F_OGG from "../assets/audio/1_20_F.ogg";
import SOUND_1_21_Gb_OGG from "../assets/audio/1_21_Gb.ogg";
import SOUND_1_22_G_OGG from "../assets/audio/1_22_G.ogg";
import SOUND_2_0_D_OGG from "../assets/audio/2_0_D.ogg";
import SOUND_2_1_Eb_OGG from "../assets/audio/2_1_Eb.ogg";
import SOUND_2_2_E_OGG from "../assets/audio/2_2_E.ogg";
import SOUND_2_3_F_OGG from "../assets/audio/2_3_F.ogg";
import SOUND_2_4_Gb_OGG from "../assets/audio/2_4_Gb.ogg";
import SOUND_2_5_G_OGG from "../assets/audio/2_5_G.ogg";
import SOUND_2_6_Ab_OGG from "../assets/audio/2_6_Ab.ogg";
import SOUND_2_7_A_OGG from "../assets/audio/2_7_A.ogg";
import SOUND_2_8_Bb_OGG from "../assets/audio/2_8_Bb.ogg";
import SOUND_2_9_B_OGG from "../assets/audio/2_9_B.ogg";
import SOUND_2_10_C_OGG from "../assets/audio/2_10_C.ogg";
import SOUND_2_11_Db_OGG from "../assets/audio/2_11_Db.ogg";
import SOUND_2_12_D_OGG from "../assets/audio/2_12_D.ogg";
import SOUND_2_13_Eb_OGG from "../assets/audio/2_13_Eb.ogg";
import SOUND_2_14_E_OGG from "../assets/audio/2_14_E.ogg";
import SOUND_2_15_F_OGG from "../assets/audio/2_15_F.ogg";
import SOUND_2_16_Gb_OGG from "../assets/audio/2_16_Gb.ogg";
import SOUND_2_17_G_OGG from "../assets/audio/2_17_G.ogg";
import SOUND_2_18_Ab_OGG from "../assets/audio/2_18_Ab.ogg";
import SOUND_2_19_A_OGG from "../assets/audio/2_19_A.ogg";
import SOUND_2_20_Bb_OGG from "../assets/audio/2_20_Bb.ogg";
import SOUND_2_21_B_OGG from "../assets/audio/2_21_B.ogg";
import SOUND_2_22_C_OGG from "../assets/audio/2_22_C.ogg";
import SOUND_3_0_G_OGG from "../assets/audio/3_0_G.ogg";
import SOUND_3_1_Ab_OGG from "../assets/audio/3_1_Ab.ogg";
import SOUND_3_2_A_OGG from "../assets/audio/3_2_A.ogg";
import SOUND_3_3_Bb_OGG from "../assets/audio/3_3_Bb.ogg";
import SOUND_3_4_B_OGG from "../assets/audio/3_4_B.ogg";
import SOUND_3_5_C_OGG from "../assets/audio/3_5_C.ogg";
import SOUND_3_6_Db_OGG from "../assets/audio/3_6_Db.ogg";
import SOUND_3_7_D_OGG from "../assets/audio/3_7_D.ogg";
import SOUND_3_8_Eb_OGG from "../assets/audio/3_8_Eb.ogg";
import SOUND_3_9_E_OGG from "../assets/audio/3_9_E.ogg";
import SOUND_3_10_F_OGG from "../assets/audio/3_10_F.ogg";
import SOUND_3_11_Gb_OGG from "../assets/audio/3_11_Gb.ogg";
import SOUND_3_12_G_OGG from "../assets/audio/3_12_G.ogg";
import SOUND_3_13_Ab_OGG from "../assets/audio/3_13_Ab.ogg";
import SOUND_3_14_A_OGG from "../assets/audio/3_14_A.ogg";
import SOUND_3_15_Bb_OGG from "../assets/audio/3_15_Bb.ogg";
import SOUND_3_16_B_OGG from "../assets/audio/3_16_B.ogg";
import SOUND_3_17_C_OGG from "../assets/audio/3_17_C.ogg";
import SOUND_3_18_Db_OGG from "../assets/audio/3_18_Db.ogg";
import SOUND_3_19_D_OGG from "../assets/audio/3_19_D.ogg";
import SOUND_3_20_Eb_OGG from "../assets/audio/3_20_Eb.ogg";
import SOUND_3_21_E_OGG from "../assets/audio/3_21_E.ogg";
import SOUND_3_22_F_OGG from "../assets/audio/3_22_F.ogg";
import SOUND_4_0_B_OGG from "../assets/audio/4_0_B.ogg";
import SOUND_4_1_C_OGG from "../assets/audio/4_1_C.ogg";
import SOUND_4_2_Db_OGG from "../assets/audio/4_2_Db.ogg";
import SOUND_4_3_D_OGG from "../assets/audio/4_3_D.ogg";
import SOUND_4_4_Eb_OGG from "../assets/audio/4_4_Eb.ogg";
import SOUND_4_5_E_OGG from "../assets/audio/4_5_E.ogg";
import SOUND_4_6_F_OGG from "../assets/audio/4_6_F.ogg";
import SOUND_4_7_Gb_OGG from "../assets/audio/4_7_Gb.ogg";
import SOUND_4_8_G_OGG from "../assets/audio/4_8_G.ogg";
import SOUND_4_9_Ab_OGG from "../assets/audio/4_9_Ab.ogg";
import SOUND_4_10_A_OGG from "../assets/audio/4_10_A.ogg";
import SOUND_4_11_Bb_OGG from "../assets/audio/4_11_Bb.ogg";
import SOUND_4_12_B_OGG from "../assets/audio/4_12_B.ogg";
import SOUND_4_13_C_OGG from "../assets/audio/4_13_C.ogg";
import SOUND_4_14_Db_OGG from "../assets/audio/4_14_Db.ogg";
import SOUND_4_15_D_OGG from "../assets/audio/4_15_D.ogg";
import SOUND_4_16_Eb_OGG from "../assets/audio/4_16_Eb.ogg";
import SOUND_4_17_E_OGG from "../assets/audio/4_17_E.ogg";
import SOUND_4_18_F_OGG from "../assets/audio/4_18_F.ogg";
import SOUND_4_19_Gb_OGG from "../assets/audio/4_19_Gb.ogg";
import SOUND_4_20_G_OGG from "../assets/audio/4_20_G.ogg";
import SOUND_4_21_Ab_OGG from "../assets/audio/4_21_Ab.ogg";
import SOUND_4_22_A_OGG from "../assets/audio/4_22_A.ogg";
import SOUND_5_0_E_OGG from "../assets/audio/5_0_E.ogg";
import SOUND_5_1_F_OGG from "../assets/audio/5_1_F.ogg";
import SOUND_5_2_Gb_OGG from "../assets/audio/5_2_Gb.ogg";
import SOUND_5_3_G_OGG from "../assets/audio/5_3_G.ogg";
import SOUND_5_4_Ab_OGG from "../assets/audio/5_4_Ab.ogg";
import SOUND_5_5_A_OGG from "../assets/audio/5_5_A.ogg";
import SOUND_5_6_Bb_OGG from "../assets/audio/5_6_Bb.ogg";
import SOUND_5_7_B_OGG from "../assets/audio/5_7_B.ogg";
import SOUND_5_8_C_OGG from "../assets/audio/5_8_C.ogg";
import SOUND_5_9_Db_OGG from "../assets/audio/5_9_Db.ogg";
import SOUND_5_10_D_OGG from "../assets/audio/5_10_D.ogg";
import SOUND_5_11_Eb_OGG from "../assets/audio/5_11_Eb.ogg";
import SOUND_5_12_E_OGG from "../assets/audio/5_12_E.ogg";
import SOUND_5_13_F_OGG from "../assets/audio/5_13_F.ogg";
import SOUND_5_14_Gb_OGG from "../assets/audio/5_14_Gb.ogg";
import SOUND_5_15_G_OGG from "../assets/audio/5_15_G.ogg";
import SOUND_5_16_Ab_OGG from "../assets/audio/5_16_Ab.ogg";
import SOUND_5_17_A_OGG from "../assets/audio/5_17_A.ogg";
import SOUND_5_18_Bb_OGG from "../assets/audio/5_18_Bb.ogg";
import SOUND_5_19_B_OGG from "../assets/audio/5_19_B.ogg";
import SOUND_5_20_C_OGG from "../assets/audio/5_20_C.ogg";
import SOUND_5_21_Db_OGG from "../assets/audio/5_21_Db.ogg";
import SOUND_5_22_D_OGG from "../assets/audio/5_22_D.ogg";

// mp3 sources for fallback
import SOUND_0_0_E_MP3 from "../assets/audio/0_0_E.mp3";
import SOUND_0_1_F_MP3 from "../assets/audio/0_1_F.mp3";
import SOUND_0_2_Gb_MP3 from "../assets/audio/0_2_Gb.mp3";
import SOUND_0_3_G_MP3 from "../assets/audio/0_3_G.mp3";
import SOUND_0_4_Ab_MP3 from "../assets/audio/0_4_Ab.mp3";
import SOUND_0_5_A_MP3 from "../assets/audio/0_5_A.mp3";
import SOUND_0_6_Bb_MP3 from "../assets/audio/0_6_Bb.mp3";
import SOUND_0_7_B_MP3 from "../assets/audio/0_7_B.mp3";
import SOUND_0_8_C_MP3 from "../assets/audio/0_8_C.mp3";
import SOUND_0_9_Db_MP3 from "../assets/audio/0_9_Db.mp3";
import SOUND_0_10_D_MP3 from "../assets/audio/0_10_D.mp3";
import SOUND_0_11_Eb_MP3 from "../assets/audio/0_11_Eb.mp3";
import SOUND_0_12_E_MP3 from "../assets/audio/0_12_E.mp3";
import SOUND_0_13_F_MP3 from "../assets/audio/0_13_F.mp3";
import SOUND_0_14_Gb_MP3 from "../assets/audio/0_14_Gb.mp3";
import SOUND_0_15_G_MP3 from "../assets/audio/0_15_G.mp3";
import SOUND_0_16_Ab_MP3 from "../assets/audio/0_16_Ab.mp3";
import SOUND_0_17_A_MP3 from "../assets/audio/0_17_A.mp3";
import SOUND_0_18_Bb_MP3 from "../assets/audio/0_18_Bb.mp3";
import SOUND_0_19_B_MP3 from "../assets/audio/0_19_B.mp3";
import SOUND_0_20_C_MP3 from "../assets/audio/0_20_C.mp3";
import SOUND_0_21_Db_MP3 from "../assets/audio/0_21_Db.mp3";
import SOUND_0_22_D_MP3 from "../assets/audio/0_22_D.mp3";
import SOUND_1_0_A_MP3 from "../assets/audio/1_0_A.mp3";
import SOUND_1_1_Bb_MP3 from "../assets/audio/1_1_Bb.mp3";
import SOUND_1_2_B_MP3 from "../assets/audio/1_2_B.mp3";
import SOUND_1_3_C_MP3 from "../assets/audio/1_3_C.mp3";
import SOUND_1_4_Db_MP3 from "../assets/audio/1_4_Db.mp3";
import SOUND_1_5_D_MP3 from "../assets/audio/1_5_D.mp3";
import SOUND_1_6_Eb_MP3 from "../assets/audio/1_6_Eb.mp3";
import SOUND_1_7_E_MP3 from "../assets/audio/1_7_E.mp3";
import SOUND_1_8_F_MP3 from "../assets/audio/1_8_F.mp3";
import SOUND_1_9_Gb_MP3 from "../assets/audio/1_9_Gb.mp3";
import SOUND_1_10_G_MP3 from "../assets/audio/1_10_G.mp3";
import SOUND_1_11_Ab_MP3 from "../assets/audio/1_11_Ab.mp3";
import SOUND_1_12_A_MP3 from "../assets/audio/1_12_A.mp3";
import SOUND_1_13_Bb_MP3 from "../assets/audio/1_13_Bb.mp3";
import SOUND_1_14_B_MP3 from "../assets/audio/1_14_B.mp3";
import SOUND_1_15_C_MP3 from "../assets/audio/1_15_C.mp3";
import SOUND_1_16_Db_MP3 from "../assets/audio/1_16_Db.mp3";
import SOUND_1_17_D_MP3 from "../assets/audio/1_17_D.mp3";
import SOUND_1_18_Eb_MP3 from "../assets/audio/1_18_Eb.mp3";
import SOUND_1_19_E_MP3 from "../assets/audio/1_19_E.mp3";
import SOUND_1_20_F_MP3 from "../assets/audio/1_20_F.mp3";
import SOUND_1_21_Gb_MP3 from "../assets/audio/1_21_Gb.mp3";
import SOUND_1_22_G_MP3 from "../assets/audio/1_22_G.mp3";
import SOUND_2_0_D_MP3 from "../assets/audio/2_0_D.mp3";
import SOUND_2_1_Eb_MP3 from "../assets/audio/2_1_Eb.mp3";
import SOUND_2_2_E_MP3 from "../assets/audio/2_2_E.mp3";
import SOUND_2_3_F_MP3 from "../assets/audio/2_3_F.mp3";
import SOUND_2_4_Gb_MP3 from "../assets/audio/2_4_Gb.mp3";
import SOUND_2_5_G_MP3 from "../assets/audio/2_5_G.mp3";
import SOUND_2_6_Ab_MP3 from "../assets/audio/2_6_Ab.mp3";
import SOUND_2_7_A_MP3 from "../assets/audio/2_7_A.mp3";
import SOUND_2_8_Bb_MP3 from "../assets/audio/2_8_Bb.mp3";
import SOUND_2_9_B_MP3 from "../assets/audio/2_9_B.mp3";
import SOUND_2_10_C_MP3 from "../assets/audio/2_10_C.mp3";
import SOUND_2_11_Db_MP3 from "../assets/audio/2_11_Db.mp3";
import SOUND_2_12_D_MP3 from "../assets/audio/2_12_D.mp3";
import SOUND_2_13_Eb_MP3 from "../assets/audio/2_13_Eb.mp3";
import SOUND_2_14_E_MP3 from "../assets/audio/2_14_E.mp3";
import SOUND_2_15_F_MP3 from "../assets/audio/2_15_F.mp3";
import SOUND_2_16_Gb_MP3 from "../assets/audio/2_16_Gb.mp3";
import SOUND_2_17_G_MP3 from "../assets/audio/2_17_G.mp3";
import SOUND_2_18_Ab_MP3 from "../assets/audio/2_18_Ab.mp3";
import SOUND_2_19_A_MP3 from "../assets/audio/2_19_A.mp3";
import SOUND_2_20_Bb_MP3 from "../assets/audio/2_20_Bb.mp3";
import SOUND_2_21_B_MP3 from "../assets/audio/2_21_B.mp3";
import SOUND_2_22_C_MP3 from "../assets/audio/2_22_C.mp3";
import SOUND_3_0_G_MP3 from "../assets/audio/3_0_G.mp3";
import SOUND_3_1_Ab_MP3 from "../assets/audio/3_1_Ab.mp3";
import SOUND_3_2_A_MP3 from "../assets/audio/3_2_A.mp3";
import SOUND_3_3_Bb_MP3 from "../assets/audio/3_3_Bb.mp3";
import SOUND_3_4_B_MP3 from "../assets/audio/3_4_B.mp3";
import SOUND_3_5_C_MP3 from "../assets/audio/3_5_C.mp3";
import SOUND_3_6_Db_MP3 from "../assets/audio/3_6_Db.mp3";
import SOUND_3_7_D_MP3 from "../assets/audio/3_7_D.mp3";
import SOUND_3_8_Eb_MP3 from "../assets/audio/3_8_Eb.mp3";
import SOUND_3_9_E_MP3 from "../assets/audio/3_9_E.mp3";
import SOUND_3_10_F_MP3 from "../assets/audio/3_10_F.mp3";
import SOUND_3_11_Gb_MP3 from "../assets/audio/3_11_Gb.mp3";
import SOUND_3_12_G_MP3 from "../assets/audio/3_12_G.mp3";
import SOUND_3_13_Ab_MP3 from "../assets/audio/3_13_Ab.mp3";
import SOUND_3_14_A_MP3 from "../assets/audio/3_14_A.mp3";
import SOUND_3_15_Bb_MP3 from "../assets/audio/3_15_Bb.mp3";
import SOUND_3_16_B_MP3 from "../assets/audio/3_16_B.mp3";
import SOUND_3_17_C_MP3 from "../assets/audio/3_17_C.mp3";
import SOUND_3_18_Db_MP3 from "../assets/audio/3_18_Db.mp3";
import SOUND_3_19_D_MP3 from "../assets/audio/3_19_D.mp3";
import SOUND_3_20_Eb_MP3 from "../assets/audio/3_20_Eb.mp3";
import SOUND_3_21_E_MP3 from "../assets/audio/3_21_E.mp3";
import SOUND_3_22_F_MP3 from "../assets/audio/3_22_F.mp3";
import SOUND_4_0_B_MP3 from "../assets/audio/4_0_B.mp3";
import SOUND_4_1_C_MP3 from "../assets/audio/4_1_C.mp3";
import SOUND_4_2_Db_MP3 from "../assets/audio/4_2_Db.mp3";
import SOUND_4_3_D_MP3 from "../assets/audio/4_3_D.mp3";
import SOUND_4_4_Eb_MP3 from "../assets/audio/4_4_Eb.mp3";
import SOUND_4_5_E_MP3 from "../assets/audio/4_5_E.mp3";
import SOUND_4_6_F_MP3 from "../assets/audio/4_6_F.mp3";
import SOUND_4_7_Gb_MP3 from "../assets/audio/4_7_Gb.mp3";
import SOUND_4_8_G_MP3 from "../assets/audio/4_8_G.mp3";
import SOUND_4_9_Ab_MP3 from "../assets/audio/4_9_Ab.mp3";
import SOUND_4_10_A_MP3 from "../assets/audio/4_10_A.mp3";
import SOUND_4_11_Bb_MP3 from "../assets/audio/4_11_Bb.mp3";
import SOUND_4_12_B_MP3 from "../assets/audio/4_12_B.mp3";
import SOUND_4_13_C_MP3 from "../assets/audio/4_13_C.mp3";
import SOUND_4_14_Db_MP3 from "../assets/audio/4_14_Db.mp3";
import SOUND_4_15_D_MP3 from "../assets/audio/4_15_D.mp3";
import SOUND_4_16_Eb_MP3 from "../assets/audio/4_16_Eb.mp3";
import SOUND_4_17_E_MP3 from "../assets/audio/4_17_E.mp3";
import SOUND_4_18_F_MP3 from "../assets/audio/4_18_F.mp3";
import SOUND_4_19_Gb_MP3 from "../assets/audio/4_19_Gb.mp3";
import SOUND_4_20_G_MP3 from "../assets/audio/4_20_G.mp3";
import SOUND_4_21_Ab_MP3 from "../assets/audio/4_21_Ab.mp3";
import SOUND_4_22_A_MP3 from "../assets/audio/4_22_A.mp3";
import SOUND_5_0_E_MP3 from "../assets/audio/5_0_E.mp3";
import SOUND_5_1_F_MP3 from "../assets/audio/5_1_F.mp3";
import SOUND_5_2_Gb_MP3 from "../assets/audio/5_2_Gb.mp3";
import SOUND_5_3_G_MP3 from "../assets/audio/5_3_G.mp3";
import SOUND_5_4_Ab_MP3 from "../assets/audio/5_4_Ab.mp3";
import SOUND_5_5_A_MP3 from "../assets/audio/5_5_A.mp3";
import SOUND_5_6_Bb_MP3 from "../assets/audio/5_6_Bb.mp3";
import SOUND_5_7_B_MP3 from "../assets/audio/5_7_B.mp3";
import SOUND_5_8_C_MP3 from "../assets/audio/5_8_C.mp3";
import SOUND_5_9_Db_MP3 from "../assets/audio/5_9_Db.mp3";
import SOUND_5_10_D_MP3 from "../assets/audio/5_10_D.mp3";
import SOUND_5_11_Eb_MP3 from "../assets/audio/5_11_Eb.mp3";
import SOUND_5_12_E_MP3 from "../assets/audio/5_12_E.mp3";
import SOUND_5_13_F_MP3 from "../assets/audio/5_13_F.mp3";
import SOUND_5_14_Gb_MP3 from "../assets/audio/5_14_Gb.mp3";
import SOUND_5_15_G_MP3 from "../assets/audio/5_15_G.mp3";
import SOUND_5_16_Ab_MP3 from "../assets/audio/5_16_Ab.mp3";
import SOUND_5_17_A_MP3 from "../assets/audio/5_17_A.mp3";
import SOUND_5_18_Bb_MP3 from "../assets/audio/5_18_Bb.mp3";
import SOUND_5_19_B_MP3 from "../assets/audio/5_19_B.mp3";
import SOUND_5_20_C_MP3 from "../assets/audio/5_20_C.mp3";
import SOUND_5_21_Db_MP3 from "../assets/audio/5_21_Db.mp3";
import SOUND_5_22_D_MP3 from "../assets/audio/5_22_D.mp3";

// Types
export interface AudioStateType {
    fretSounds: { [key in string]: Howl };
}

// Reducers
export const audioReducers = {
    playNote(
        state: AudioStateType,
        stringIndex: number,
        fretIndex: number
    ): AudioStateType {
        const noteName =
            FLAT_NAMES[mod(STANDARD_TUNING[stringIndex] + fretIndex, 12)];
        const key = `${stringIndex}_${fretIndex}_${noteName.replace("♭", "b")}`;
        const sound = state.fretSounds[key];

        if (sound) {
            sound.seek(0);
            sound.play();
        }
        return state;
    },
    strumChord(
        state: AudioStateType,
        fretboard: StringSwitchType
    ): AudioStateType {
        // figure out which notes are highlighted on each string
        // get the rightmost value
        // play chord with very small delay between notes
        let chordSounds: [number, number][] = [];

        for (let stringIndex in fretboard) {
            let fretIndex = -1;
            let fretString = fretboard[stringIndex];
            for (let i = 0; i < STRING_SIZE; i++) {
                let fretValue = fretString[i + STANDARD_TUNING[stringIndex]];
                if (fretValue === HIGHLIGHTED) fretIndex = i;
            }
            if (fretIndex >= 0) chordSounds.push([+stringIndex, fretIndex]);
        }

        if (chordSounds.length) {
            let playCount = 0;
            let STRUM_DELAY = 70;
            let interval = setInterval(() => {
                const [stringIndex, fretIndex] = chordSounds[playCount];
                this.playNote(state, stringIndex, fretIndex);
                playCount++;
                if (playCount >= chordSounds.length) clearInterval(interval);
            }, STRUM_DELAY);
        }

        // TODO: need to do this somewhere
        // function canPlay() {
        //     isPlayingRef.current = false;
        // }
        // audioRef.current.addEventListener("ended", canPlay);
        // audioRef.current.addEventListener("canplaythrough", canPlay);

        return state;
    },
    arpeggiateChord(
        state: AudioStateType,
        fretboard: StringSwitchType
    ): AudioStateType {
        // figure out which notes are highlighted on each string
        // construct notes to be played forward and backwards
        // play chord with medium delay between notes
        let arpeggioSounds: [number, number][] = [];

        for (let stringIndex in fretboard) {
            let fretString = fretboard[stringIndex];
            for (let i = 0; i < STRING_SIZE; i++) {
                let fretValue = fretString[i + STANDARD_TUNING[stringIndex]];
                if (fretValue === HIGHLIGHTED)
                    arpeggioSounds.push([+stringIndex, i]);
            }
        }

        arpeggioSounds = arpeggioSounds.concat(
            arpeggioSounds.slice(0, -1).reverse()
        );

        let playCount = 0;
        let STRUM_DELAY = 200;
        let interval = setInterval(() => {
            const [stringIndex, fretIndex] = arpeggioSounds[playCount];
            this.playNote(state, stringIndex, fretIndex);
            playCount++;
            if (playCount >= arpeggioSounds.length) clearInterval(interval);
        }, STRUM_DELAY);

        // TODO: need to do this somewhere
        // function canPlay() {
        //     isPlayingRef.current = false;
        // }
        // audioRef.current.addEventListener("ended", canPlay);
        // audioRef.current.addEventListener("canplaythrough", canPlay);

        return state;
    },
};

// Store
export class AudioStore extends Store<AudioStateType, typeof audioReducers> {
    constructor() {
        super(DEFAULT_AUDIO_STATE(), audioReducers);
    }
}

// Default State

export function DEFAULT_AUDIO_STATE(): AudioStateType {
    // const names = [];
    // for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
    //     for (let i = 0; i < STRING_SIZE; i++) {
    //         const name = FLAT_NAMES[mod(i + STANDARD_TUNING[stringIndex], 12)];
    //         names.push(`${stringIndex}_${i}_${name}.ogg`);
    //     }
    // }

    function createHowl(urls: string[]): Howl {
        return new Howl({
            src: urls,
            autoplay: false,
            loop: false,
            volume: 0.1,
            // onend: function () {
            // console.log("Finished!");
            // },
        });
    }

    return {
        fretSounds: {
            "0_0_E": createHowl([SOUND_0_0_E_OGG, SOUND_0_0_E_MP3]),
            "0_1_F": createHowl([SOUND_0_1_F_OGG, SOUND_0_1_F_MP3]),
            "0_2_Gb": createHowl([SOUND_0_2_Gb_OGG, SOUND_0_2_Gb_MP3]),
            "0_3_G": createHowl([SOUND_0_3_G_OGG, SOUND_0_3_G_MP3]),
            "0_4_Ab": createHowl([SOUND_0_4_Ab_OGG, SOUND_0_4_Ab_MP3]),
            "0_5_A": createHowl([SOUND_0_5_A_OGG, SOUND_0_5_A_MP3]),
            "0_6_Bb": createHowl([SOUND_0_6_Bb_OGG, SOUND_0_6_Bb_MP3]),
            "0_7_B": createHowl([SOUND_0_7_B_OGG, SOUND_0_7_B_MP3]),
            "0_8_C": createHowl([SOUND_0_8_C_OGG, SOUND_0_8_C_MP3]),
            "0_9_Db": createHowl([SOUND_0_9_Db_OGG, SOUND_0_9_Db_MP3]),
            "0_10_D": createHowl([SOUND_0_10_D_OGG, SOUND_0_10_D_MP3]),
            "0_11_Eb": createHowl([SOUND_0_11_Eb_OGG, SOUND_0_11_Eb_MP3]),
            "0_12_E": createHowl([SOUND_0_12_E_OGG, SOUND_0_12_E_MP3]),
            "0_13_F": createHowl([SOUND_0_13_F_OGG, SOUND_0_13_F_MP3]),
            "0_14_Gb": createHowl([SOUND_0_14_Gb_OGG, SOUND_0_14_Gb_MP3]),
            "0_15_G": createHowl([SOUND_0_15_G_OGG, SOUND_0_15_G_MP3]),
            "0_16_Ab": createHowl([SOUND_0_16_Ab_OGG, SOUND_0_16_Ab_MP3]),
            "0_17_A": createHowl([SOUND_0_17_A_OGG, SOUND_0_17_A_MP3]),
            "0_18_Bb": createHowl([SOUND_0_18_Bb_OGG, SOUND_0_18_Bb_MP3]),
            "0_19_B": createHowl([SOUND_0_19_B_OGG, SOUND_0_19_B_MP3]),
            "0_20_C": createHowl([SOUND_0_20_C_OGG, SOUND_0_20_C_MP3]),
            "0_21_Db": createHowl([SOUND_0_21_Db_OGG, SOUND_0_21_Db_MP3]),
            "0_22_D": createHowl([SOUND_0_22_D_OGG, SOUND_0_22_D_MP3]),
            "1_0_A": createHowl([SOUND_1_0_A_OGG, SOUND_1_0_A_MP3]),
            "1_1_Bb": createHowl([SOUND_1_1_Bb_OGG, SOUND_1_1_Bb_MP3]),
            "1_2_B": createHowl([SOUND_1_2_B_OGG, SOUND_1_2_B_MP3]),
            "1_3_C": createHowl([SOUND_1_3_C_OGG, SOUND_1_3_C_MP3]),
            "1_4_Db": createHowl([SOUND_1_4_Db_OGG, SOUND_1_4_Db_MP3]),
            "1_5_D": createHowl([SOUND_1_5_D_OGG, SOUND_1_5_D_MP3]),
            "1_6_Eb": createHowl([SOUND_1_6_Eb_OGG, SOUND_1_6_Eb_MP3]),
            "1_7_E": createHowl([SOUND_1_7_E_OGG, SOUND_1_7_E_MP3]),
            "1_8_F": createHowl([SOUND_1_8_F_OGG, SOUND_1_8_F_MP3]),
            "1_9_Gb": createHowl([SOUND_1_9_Gb_OGG, SOUND_1_9_Gb_MP3]),
            "1_10_G": createHowl([SOUND_1_10_G_OGG, SOUND_1_10_G_MP3]),
            "1_11_Ab": createHowl([SOUND_1_11_Ab_OGG, SOUND_1_11_Ab_MP3]),
            "1_12_A": createHowl([SOUND_1_12_A_OGG, SOUND_1_12_A_MP3]),
            "1_13_Bb": createHowl([SOUND_1_13_Bb_OGG, SOUND_1_13_Bb_MP3]),
            "1_14_B": createHowl([SOUND_1_14_B_OGG, SOUND_1_14_B_MP3]),
            "1_15_C": createHowl([SOUND_1_15_C_OGG, SOUND_1_15_C_MP3]),
            "1_16_Db": createHowl([SOUND_1_16_Db_OGG, SOUND_1_16_Db_MP3]),
            "1_17_D": createHowl([SOUND_1_17_D_OGG, SOUND_1_17_D_MP3]),
            "1_18_Eb": createHowl([SOUND_1_18_Eb_OGG, SOUND_1_18_Eb_MP3]),
            "1_19_E": createHowl([SOUND_1_19_E_OGG, SOUND_1_19_E_MP3]),
            "1_20_F": createHowl([SOUND_1_20_F_OGG, SOUND_1_20_F_MP3]),
            "1_21_Gb": createHowl([SOUND_1_21_Gb_OGG, SOUND_1_21_Gb_MP3]),
            "1_22_G": createHowl([SOUND_1_22_G_OGG, SOUND_1_22_G_MP3]),
            "2_0_D": createHowl([SOUND_2_0_D_OGG, SOUND_2_0_D_MP3]),
            "2_1_Eb": createHowl([SOUND_2_1_Eb_OGG, SOUND_2_1_Eb_MP3]),
            "2_2_E": createHowl([SOUND_2_2_E_OGG, SOUND_2_2_E_MP3]),
            "2_3_F": createHowl([SOUND_2_3_F_OGG, SOUND_2_3_F_MP3]),
            "2_4_Gb": createHowl([SOUND_2_4_Gb_OGG, SOUND_2_4_Gb_MP3]),
            "2_5_G": createHowl([SOUND_2_5_G_OGG, SOUND_2_5_G_MP3]),
            "2_6_Ab": createHowl([SOUND_2_6_Ab_OGG, SOUND_2_6_Ab_MP3]),
            "2_7_A": createHowl([SOUND_2_7_A_OGG, SOUND_2_7_A_MP3]),
            "2_8_Bb": createHowl([SOUND_2_8_Bb_OGG, SOUND_2_8_Bb_MP3]),
            "2_9_B": createHowl([SOUND_2_9_B_OGG, SOUND_2_9_B_MP3]),
            "2_10_C": createHowl([SOUND_2_10_C_OGG, SOUND_2_10_C_MP3]),
            "2_11_Db": createHowl([SOUND_2_11_Db_OGG, SOUND_2_11_Db_MP3]),
            "2_12_D": createHowl([SOUND_2_12_D_OGG, SOUND_2_12_D_MP3]),
            "2_13_Eb": createHowl([SOUND_2_13_Eb_OGG, SOUND_2_13_Eb_MP3]),
            "2_14_E": createHowl([SOUND_2_14_E_OGG, SOUND_2_14_E_MP3]),
            "2_15_F": createHowl([SOUND_2_15_F_OGG, SOUND_2_15_F_MP3]),
            "2_16_Gb": createHowl([SOUND_2_16_Gb_OGG, SOUND_2_16_Gb_MP3]),
            "2_17_G": createHowl([SOUND_2_17_G_OGG, SOUND_2_17_G_MP3]),
            "2_18_Ab": createHowl([SOUND_2_18_Ab_OGG, SOUND_2_18_Ab_MP3]),
            "2_19_A": createHowl([SOUND_2_19_A_OGG, SOUND_2_19_A_MP3]),
            "2_20_Bb": createHowl([SOUND_2_20_Bb_OGG, SOUND_2_20_Bb_MP3]),
            "2_21_B": createHowl([SOUND_2_21_B_OGG, SOUND_2_21_B_MP3]),
            "2_22_C": createHowl([SOUND_2_22_C_OGG, SOUND_2_22_C_MP3]),
            "3_0_G": createHowl([SOUND_3_0_G_OGG, SOUND_3_0_G_MP3]),
            "3_1_Ab": createHowl([SOUND_3_1_Ab_OGG, SOUND_3_1_Ab_MP3]),
            "3_2_A": createHowl([SOUND_3_2_A_OGG, SOUND_3_2_A_MP3]),
            "3_3_Bb": createHowl([SOUND_3_3_Bb_OGG, SOUND_3_3_Bb_MP3]),
            "3_4_B": createHowl([SOUND_3_4_B_OGG, SOUND_3_4_B_MP3]),
            "3_5_C": createHowl([SOUND_3_5_C_OGG, SOUND_3_5_C_MP3]),
            "3_6_Db": createHowl([SOUND_3_6_Db_OGG, SOUND_3_6_Db_MP3]),
            "3_7_D": createHowl([SOUND_3_7_D_OGG, SOUND_3_7_D_MP3]),
            "3_8_Eb": createHowl([SOUND_3_8_Eb_OGG, SOUND_3_8_Eb_MP3]),
            "3_9_E": createHowl([SOUND_3_9_E_OGG, SOUND_3_9_E_MP3]),
            "3_10_F": createHowl([SOUND_3_10_F_OGG, SOUND_3_10_F_MP3]),
            "3_11_Gb": createHowl([SOUND_3_11_Gb_OGG, SOUND_3_11_Gb_MP3]),
            "3_12_G": createHowl([SOUND_3_12_G_OGG, SOUND_3_12_G_MP3]),
            "3_13_Ab": createHowl([SOUND_3_13_Ab_OGG, SOUND_3_13_Ab_MP3]),
            "3_14_A": createHowl([SOUND_3_14_A_OGG, SOUND_3_14_A_MP3]),
            "3_15_Bb": createHowl([SOUND_3_15_Bb_OGG, SOUND_3_15_Bb_MP3]),
            "3_16_B": createHowl([SOUND_3_16_B_OGG, SOUND_3_16_B_MP3]),
            "3_17_C": createHowl([SOUND_3_17_C_OGG, SOUND_3_17_C_MP3]),
            "3_18_Db": createHowl([SOUND_3_18_Db_OGG, SOUND_3_18_Db_MP3]),
            "3_19_D": createHowl([SOUND_3_19_D_OGG, SOUND_3_19_D_MP3]),
            "3_20_Eb": createHowl([SOUND_3_20_Eb_OGG, SOUND_3_20_Eb_MP3]),
            "3_21_E": createHowl([SOUND_3_21_E_OGG, SOUND_3_21_E_MP3]),
            "3_22_F": createHowl([SOUND_3_22_F_OGG, SOUND_3_22_F_MP3]),
            "4_0_B": createHowl([SOUND_4_0_B_OGG, SOUND_4_0_B_MP3]),
            "4_1_C": createHowl([SOUND_4_1_C_OGG, SOUND_4_1_C_MP3]),
            "4_2_Db": createHowl([SOUND_4_2_Db_OGG, SOUND_4_2_Db_MP3]),
            "4_3_D": createHowl([SOUND_4_3_D_OGG, SOUND_4_3_D_MP3]),
            "4_4_Eb": createHowl([SOUND_4_4_Eb_OGG, SOUND_4_4_Eb_MP3]),
            "4_5_E": createHowl([SOUND_4_5_E_OGG, SOUND_4_5_E_MP3]),
            "4_6_F": createHowl([SOUND_4_6_F_OGG, SOUND_4_6_F_MP3]),
            "4_7_Gb": createHowl([SOUND_4_7_Gb_OGG, SOUND_4_7_Gb_MP3]),
            "4_8_G": createHowl([SOUND_4_8_G_OGG, SOUND_4_8_G_MP3]),
            "4_9_Ab": createHowl([SOUND_4_9_Ab_OGG, SOUND_4_9_Ab_MP3]),
            "4_10_A": createHowl([SOUND_4_10_A_OGG, SOUND_4_10_A_MP3]),
            "4_11_Bb": createHowl([SOUND_4_11_Bb_OGG, SOUND_4_11_Bb_MP3]),
            "4_12_B": createHowl([SOUND_4_12_B_OGG, SOUND_4_12_B_MP3]),
            "4_13_C": createHowl([SOUND_4_13_C_OGG, SOUND_4_13_C_MP3]),
            "4_14_Db": createHowl([SOUND_4_14_Db_OGG, SOUND_4_14_Db_MP3]),
            "4_15_D": createHowl([SOUND_4_15_D_OGG, SOUND_4_15_D_MP3]),
            "4_16_Eb": createHowl([SOUND_4_16_Eb_OGG, SOUND_4_16_Eb_MP3]),
            "4_17_E": createHowl([SOUND_4_17_E_OGG, SOUND_4_17_E_MP3]),
            "4_18_F": createHowl([SOUND_4_18_F_OGG, SOUND_4_18_F_MP3]),
            "4_19_Gb": createHowl([SOUND_4_19_Gb_OGG, SOUND_4_19_Gb_MP3]),
            "4_20_G": createHowl([SOUND_4_20_G_OGG, SOUND_4_20_G_MP3]),
            "4_21_Ab": createHowl([SOUND_4_21_Ab_OGG, SOUND_4_21_Ab_MP3]),
            "4_22_A": createHowl([SOUND_4_22_A_OGG, SOUND_4_22_A_MP3]),
            "5_0_E": createHowl([SOUND_5_0_E_OGG, SOUND_5_0_E_MP3]),
            "5_1_F": createHowl([SOUND_5_1_F_OGG, SOUND_5_1_F_MP3]),
            "5_2_Gb": createHowl([SOUND_5_2_Gb_OGG, SOUND_5_2_Gb_MP3]),
            "5_3_G": createHowl([SOUND_5_3_G_OGG, SOUND_5_3_G_MP3]),
            "5_4_Ab": createHowl([SOUND_5_4_Ab_OGG, SOUND_5_4_Ab_MP3]),
            "5_5_A": createHowl([SOUND_5_5_A_OGG, SOUND_5_5_A_MP3]),
            "5_6_Bb": createHowl([SOUND_5_6_Bb_OGG, SOUND_5_6_Bb_MP3]),
            "5_7_B": createHowl([SOUND_5_7_B_OGG, SOUND_5_7_B_MP3]),
            "5_8_C": createHowl([SOUND_5_8_C_OGG, SOUND_5_8_C_MP3]),
            "5_9_Db": createHowl([SOUND_5_9_Db_OGG, SOUND_5_9_Db_MP3]),
            "5_10_D": createHowl([SOUND_5_10_D_OGG, SOUND_5_10_D_MP3]),
            "5_11_Eb": createHowl([SOUND_5_11_Eb_OGG, SOUND_5_11_Eb_MP3]),
            "5_12_E": createHowl([SOUND_5_12_E_OGG, SOUND_5_12_E_MP3]),
            "5_13_F": createHowl([SOUND_5_13_F_OGG, SOUND_5_13_F_MP3]),
            "5_14_Gb": createHowl([SOUND_5_14_Gb_OGG, SOUND_5_14_Gb_MP3]),
            "5_15_G": createHowl([SOUND_5_15_G_OGG, SOUND_5_15_G_MP3]),
            "5_16_Ab": createHowl([SOUND_5_16_Ab_OGG, SOUND_5_16_Ab_MP3]),
            "5_17_A": createHowl([SOUND_5_17_A_OGG, SOUND_5_17_A_MP3]),
            "5_18_Bb": createHowl([SOUND_5_18_Bb_OGG, SOUND_5_18_Bb_MP3]),
            "5_19_B": createHowl([SOUND_5_19_B_OGG, SOUND_5_19_B_MP3]),
            "5_20_C": createHowl([SOUND_5_20_C_OGG, SOUND_5_20_C_MP3]),
            "5_21_Db": createHowl([SOUND_5_21_Db_OGG, SOUND_5_21_Db_MP3]),
            "5_22_D": createHowl([SOUND_5_22_D_OGG, SOUND_5_22_D_MP3]),
        },
    };
}
