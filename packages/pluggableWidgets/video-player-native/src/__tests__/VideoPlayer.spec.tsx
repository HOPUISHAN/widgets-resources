import { dynamicValue } from "@mendix/piw-utils-internal";
import { createElement } from "react";
import { Text, View } from "react-native";
import { fireEvent, render } from "react-native-testing-library";
import { VideoProperties } from "react-native-video";

import { VideoPlayer } from "../VideoPlayer";
import { VideoPlayerProps } from "../../typings/VideoPlayerProps";
import { VideoStyle } from "../ui/Styles";

jest.mock("react-native-video", () => "Video");
jest.mock("react-native-system-navigation-bar", () => ({
    navigationHide: jest.fn(),
    navigationShow: jest.fn()
}));

describe("VideoPlayer", () => {
    let defaultProps: VideoPlayerProps<VideoStyle>;
    beforeEach(() => {
        defaultProps = {
            name: "video-player-test",
            style: [],
            videoUrl: dynamicValue("https://mendix.com/video.mp4"),
            autoStart: false,
            muted: false,
            loop: false,
            showControls: true,
            aspectRatio: false
        };
    });

    it("renders a loading indicator", () => {
        const component = render(<VideoPlayer {...defaultProps} />);

        expect(component.toJSON()).toMatchSnapshot();
    });

    it("passes the right props to the video player", () => {
        const component = render(<VideoPlayer {...defaultProps} />);
        const props = component.getByTestId("video-player-test").props as VideoProperties;

        expect(props.source).toEqual({ uri: "https://mendix.com/video.mp4" });
        expect(props.paused).toBe(true);
        expect(props.muted).toBe(false);
        expect(props.repeat).toBe(false);
        expect(props.controls).toBe(true);
        expect(props.style).toEqual({ height: 0 });
    });

    it("hides the loading indicator after load", () => {
        const component = render(<VideoPlayer {...defaultProps} />);

        fireEvent(component.getByTestId("video-player-test"), "load", { naturalSize: { width: 640, height: 360 } });

        expect(component.toJSON()).toMatchSnapshot();
        expect(component.getByTestId("video-player-test").props.style).toEqual({ width: "100%", aspectRatio: 16 / 9 });
    });

    it("shows the loading indicator if the source changes", () => {
        const component = render(<VideoPlayer {...defaultProps} />);

        fireEvent(component.getByTestId("video-player-test"), "load", { naturalSize: { width: 640, height: 360 } });
        fireEvent(component.getByTestId("video-player-test"), "loadStart");

        expect(component.toJSON()).toMatchSnapshot();
        expect(component.getByTestId("video-player-test").props.style).toEqual({ height: 0 });
    });

    it("load a video and calculate the aspect ratio", () => {
        const component = render(<VideoPlayer {...defaultProps} aspectRatio />);

        fireEvent(component.getByTestId("video-player-test"), "load", { naturalSize: { width: 1080, height: 554 } });

        expect(component.toJSON()).toMatchSnapshot();
        expect(component.UNSAFE_getByType(View).props.style).toEqual({
            alignItems: "center",
            aspectRatio: 1.9494584837545126,
            backgroundColor: "black",
            justifyContent: "center"
        });
    });

    it("renders an error", () => {
        const component = render(<VideoPlayer {...defaultProps} />);

        fireEvent(component.getByTestId("video-player-test"), "error");

        expect(component.UNSAFE_getByType(Text).props.style).toEqual({ color: "white" });
        expect(component.UNSAFE_getByType(Text).props.children).toEqual("The video failed to load");
    });

    describe("VideoPlayerAndroid", () => {
        beforeAll(() => {
            jest.mock("react-native/Libraries/Utilities/Platform", () => ({
                OS: "android",
                select: jest.fn(dict => dict.android)
            }));
        });
        it("render video with controls", () => {
            const component = render(<VideoPlayer {...defaultProps} />);
            expect(component).toMatchSnapshot();
        });
        it("render video without controls if showControls is set to false", () => {
            const component = render(<VideoPlayer {...defaultProps} showControls={false} />);
            expect(component).toMatchSnapshot();
        });
    });
});
