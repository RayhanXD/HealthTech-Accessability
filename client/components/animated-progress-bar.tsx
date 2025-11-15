import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, LayoutChangeEvent } from 'react-native';
import { BrandColors } from '@/constants/theme';

interface AnimatedProgressBarProps {
  width: number;
  backgroundColor?: string;
  backgroundBarColor?: string;
  borderRadius?: number;
  height?: number;
  animationDuration?: number;
}

export default function AnimatedProgressBar({
  width,
  backgroundColor = BrandColors.green,
  backgroundBarColor = BrandColors.white,
  borderRadius = 999,
  height = 6,
  animationDuration = 500,
}: AnimatedProgressBarProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const animatedWidth = useRef(new Animated.Value(0)).current;

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width: layoutWidth } = event.nativeEvent.layout;
    if (layoutWidth > 0 && layoutWidth !== containerWidth) {
      setContainerWidth(layoutWidth);
    }
  };

  useEffect(() => {
    if (containerWidth > 0) {
      // Calculate the actual width based on container width
      // If width is less than containerWidth, use it directly
      // Otherwise, use percentage
      const targetWidth = width <= containerWidth ? width : containerWidth;
      
      Animated.timing(animatedWidth, {
        toValue: targetWidth,
        duration: animationDuration,
        useNativeDriver: false, // width animation doesn't support native driver
      }).start();
    }
  }, [width, containerWidth, animationDuration]);

  return (
    <View 
      style={[styles.container, { height, borderRadius }]}
      onLayout={handleLayout}
    >
      <View style={[styles.background, { backgroundColor: backgroundBarColor, borderRadius }]} />
      {containerWidth > 0 && (
        <Animated.View
          style={[
            styles.fill,
            {
              width: animatedWidth,
              backgroundColor,
              borderRadius,
              height,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  background: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});

