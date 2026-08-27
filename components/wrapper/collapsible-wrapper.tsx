import React, { useState, ReactNode } from "react";
import { View, LayoutChangeEvent } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

interface CollapsableContainerProps {
  children: ReactNode;
  expanded: boolean;
}

export const CollapsableContainer: React.FC<CollapsableContainerProps> = ({
  children,
  expanded,
}) => {
  const [height, setHeight] = useState(0);

  const onLayout = (event: LayoutChangeEvent) => {
    const onLayoutHeight = event.nativeEvent.layout.height;

    if (onLayoutHeight > 0 && height !== onLayoutHeight) {
      setHeight(onLayoutHeight);
    }
  };

  const collapsableStyle = useAnimatedStyle(() => {
    return {
      height: expanded ? withTiming(height) : withTiming(0),
    };
  }, [height, expanded]);

  return (
    <Animated.View style={[collapsableStyle, { overflow: "hidden" }]}>
      <View style={{ position: "absolute" }} onLayout={onLayout}>
        {children}
      </View>
    </Animated.View>
  );
};
