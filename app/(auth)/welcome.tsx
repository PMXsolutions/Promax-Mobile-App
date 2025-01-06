import { router } from "expo-router";
import { useRef, useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";
import onboarding from "@/constants/data";
import Text from "@/components/shared/text";
import CustomButton from "@/components/shared/custom-button";
import { THEME } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Welcome = () => {
  const swiperRef = useRef<Swiper>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const isLastSlide = activeIndex === onboarding.length - 1;

  const completeOnboarding = async () => {
    await AsyncStorage.setItem("onboardingComplete", "true");
    router.replace("/(auth)/sign-in"); // Navigate to the main app
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        onPress={() => {
          router.replace("/(auth)/sign-in");
        }}
        style={styles.skipButton}
      >
        <Text weight="bold" size="md">
          Skip
        </Text>
      </TouchableOpacity>

      <Swiper
        ref={swiperRef}
        loop={false}
        dot={
          <View
            style={[styles.dot, { backgroundColor: "#E2E8F0", width: 25 }]}
          />
        }
        activeDot={
          <View
            style={[
              styles.dot,
              { backgroundColor: THEME.colors.secondary, width: 32 },
            ]}
          />
        }
        onIndexChanged={(index) => setActiveIndex(index)}
      >
        {onboarding.map((item) => (
          <View
            key={item.id}
            style={{
              //   flex: 1,
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
          >
            <Image
              source={item.img}
              resizeMode="contain"
              style={{ width: "100%" }}
            />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                marginTop: 40,
              }}
            >
              <Text
                size="3xl"
                weight="bold"
                style={{
                  marginHorizontal: 20,
                  textAlign: "center",
                }}
              >
                {item.title}
              </Text>
            </View>
            <Text
              size="md"
              weight="semiBold"
              style={{
                marginHorizontal: 20,
                marginTop: 12,
                textAlign: "center",
                color: "#858585",
              }}
            >
              {item.description}
            </Text>
          </View>
        ))}
      </Swiper>
      <View
        style={{
          width: "91.666667%",
          marginTop: 40,
          marginBottom: 20,
        }}
      >
        <CustomButton
          title={isLastSlide ? "Get Started" : "Next"}
          onPress={() =>
            isLastSlide ? completeOnboarding() : swiperRef.current?.scrollBy(1)
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
  },
  skipButton: {
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    padding: 20,
  },
  dot: {
    height: 5,
    marginHorizontal: 4,
    borderRadius: 50,
  },
});
