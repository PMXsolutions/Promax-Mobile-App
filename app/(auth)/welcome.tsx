import { router } from "expo-router";
import { useRef, useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import Swiper from "react-native-swiper";
import onboarding from "@/constants/data";
import Text from "@/components/shared/text";
import CustomButton from "@/components/shared/custom-button";
import { THEME } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ScreenWrapper from "@/components/wrapper/screen-wrapper";
import storageUtil from "@/utils/storage";
import { STORAGE_KEYS } from "@/constants/storageKeys";

const Welcome = () => {
  const swiperRef = useRef<Swiper>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const isLastSlide = activeIndex === onboarding.length - 1;

  const completeOnboarding = async () => {
    await storageUtil.setItem(STORAGE_KEYS.ONBOARDED, "true");
    router.replace("/"); // 👈 This fixes the bug by re-running _layout.tsx logic
  };

  return (
    <ScreenWrapper barStyle="dark-content">
      <TouchableOpacity onPress={completeOnboarding} style={styles.skipButton}>
        <Text weight="bold" size="md">
          Skip
        </Text>
      </TouchableOpacity>

      {/* Fix: Constrain swiper height and make dots stable */}
      <View style={styles.swiperContainer}>
        <Swiper
          ref={swiperRef}
          loop={false}
          showsPagination={true}
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
            <View key={item.id} style={styles.slide}>
              <Image
                source={item.img}
                resizeMode="cover"
                style={styles.image}
              />
              <Text size="3xl" weight="bold" style={styles.title}>
                {item.title}
              </Text>
              <Text size="md" weight="semiBold" style={styles.description}>
                {item.description}
              </Text>
            </View>
          ))}
        </Swiper>
      </View>

      <View style={styles.buttonContainer}>
        <CustomButton
          title={isLastSlide ? "Get Started" : "Next"}
          onPress={() =>
            isLastSlide ? completeOnboarding() : swiperRef.current?.scrollBy(1)
          }
        />
      </View>
    </ScreenWrapper>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  skipButton: {
    width: "100%",
    alignItems: "flex-end",
    padding: 20,
  },
  swiperContainer: {
    flex: 1, // ✅ allow swiper to expand properly
    justifyContent: "center",
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  image: {
    width: "100%",
    // height: 250,
  },
  title: {
    marginTop: 40,
    marginHorizontal: 20,
    textAlign: "center",
  },
  description: {
    marginTop: 12,
    marginHorizontal: 20,
    textAlign: "center",
    color: "#858585",
  },
  dot: {
    height: 5,
    borderRadius: 50,
    marginHorizontal: 4,
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 40,
    paddingHorizontal: THEME.spacing.gutter,
    justifyContent: "center",
  },
});
