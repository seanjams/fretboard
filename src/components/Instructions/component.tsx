import React, { useEffect, useRef, useState } from "react";
import SlideMovie from "../../assets/video/example.mp4";
import { AppStore } from "../../store";
import { getFretboardDimensions } from "../../utils";
import { Div } from "../Common";
import { ContainerDiv, VideoContainer } from "./style";

// InstructionVideo
interface VideoProps {
    src: string;
    width: number;
    height: number;
}

const InstructionVideo: React.FC<VideoProps> = ({ src, width, height }) => {
    return (
        <VideoContainer width={`${width}px`} height={`${height}px`}>
            <Div />
            <video autoPlay loop muted controls={false}>
                <source src={src} type="video/mp4"></source>
            </video>
        </VideoContainer>
    );
};

// Instructions
interface Props {
    appStore: AppStore;
}

export const Instructions: React.FC<Props> = ({ appStore }) => {
    // dimensions of phone that videos were generated with
    const { screenHeight } = getFretboardDimensions();
    const aspectRatio = 844 / 390;
    const defaultHeight = screenHeight * 0.7;
    const defaultWidth = defaultHeight * aspectRatio;
    const [[videoWidth, videoHeight], setVideoDimensions] = useState([
        defaultWidth,
        defaultHeight,
    ]);
    const instructionsContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!instructionsContainerRef.current) return;
        const containerWidth = instructionsContainerRef.current.offsetWidth;
        const videoWidth = containerWidth * 0.8;
        const videoHeight = videoWidth / aspectRatio;
        setVideoDimensions([videoWidth, videoHeight]);
    }, []);

    return (
        <ContainerDiv ref={instructionsContainerRef}>
            These are the instructions we've been waiting for.
            <br />
            <br />
            <InstructionVideo
                src={SlideMovie}
                width={videoWidth}
                height={videoHeight}
            />
        </ContainerDiv>
    );
};
