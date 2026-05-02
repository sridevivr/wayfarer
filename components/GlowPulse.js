import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

// Ports the visual design's `.gp` CSS class (glowPulse 2.8s infinite) to
// RN: opacity oscillates 0.5 → 1 → 0.5 on a 2.8s ease-in-out loop.
// Uses the native driver so the animation runs off the JS thread.
export default function GlowPulse({ children, duration = 2800, minOpacity = 0.5, style }) {
  const anim = useRef(new Animated.Value(minOpacity)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: minOpacity,
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim, duration, minOpacity]);

  return <Animated.View style={[{ opacity: anim }, style]}>{children}</Animated.View>;
}
