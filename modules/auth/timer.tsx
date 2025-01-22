import Text from "@/components/shared/text";
import { THEME } from "@/constants/theme";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native";

interface TimerProps {
  initialMinutes?: number;
  initialSeconds?: number;
  onExpire?: () => void;
  resetTimer?: () => void;
}

const Timer: React.FC<TimerProps> = ({
  initialMinutes = 0,
  initialSeconds = 59,
  onExpire,
  resetTimer,
}) => {
  const [minutes, setMinutes] = useState<number>(initialMinutes);
  const [seconds, setSeconds] = useState<number>(initialSeconds);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      if (seconds > 0) {
        setSeconds((prevSeconds) => prevSeconds - 1);
      } else if (minutes > 0 && seconds === 0) {
        setMinutes((prevMinutes) => prevMinutes - 1);
        setSeconds(59);
      } else if (minutes === 0 && seconds === 0) {
        clearInterval(timerInterval);
        onExpire?.();
        resetTimer?.();
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [minutes, seconds, onExpire, resetTimer]);

  return (
    <Text weight="semiBold" style={styles.timerText}>
      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </Text>
  );
};

const styles = StyleSheet.create({
  timerText: {
    color: THEME.colors.primary,
    fontSize: THEME.fontSize.md,
  },
});

export default Timer;
