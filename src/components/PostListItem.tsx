import { useVideoPlayer, VideoView } from "expo-video";
import { Dimensions, View } from "react-native";

const videoSource =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export default function PostListItem() {
  const { height } = Dimensions.get("window");
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true;
    player.play();
  });

  return (
    <View style={{ height }} className="w-full bg-black">
      <VideoView
        style={{ flex: 1 }}
        player={player}
        contentFit="cover"
        nativeControls={false}
      />
    </View>
  );
}
