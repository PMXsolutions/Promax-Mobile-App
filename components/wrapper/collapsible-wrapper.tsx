import React, { useEffect, useState, ReactNode } from "react";
import { View, LayoutChangeEvent } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
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
  const animatedHeight = useSharedValue(expanded ? height : 0);

  const onLayout = (event: LayoutChangeEvent) => {
    const onLayoutHeight = event.nativeEvent.layout.height;

    if (onLayoutHeight > 0 && height !== onLayoutHeight) {
      setHeight(onLayoutHeight);
      if (expanded) {
        animatedHeight.value = onLayoutHeight;
      }
    }
  };

  const collapsableStyle = useAnimatedStyle(() => {
    return {
      height: expanded ? withTiming(height) : withTiming(0),
    };
  }, [height, expanded]);

  useEffect(() => {
    if (expanded && height > 0) {
      animatedHeight.value = height;
    } else {
      animatedHeight.value = 0;
    }
  }, [expanded, height]);

  return (
    <Animated.View style={[collapsableStyle, { overflow: "hidden" }]}>
      <View style={{ position: "absolute" }} onLayout={onLayout}>
        {children}
      </View>
    </Animated.View>
  );
};
