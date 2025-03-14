import React, { useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import useAuthStore from "@/store/use-auth-store";
import { profileQuery } from "@/hooks/queries/profile";
import ScreenWrapper from "@/components/wrapper/screen-wrapper";
import { THEME } from "@/constants/theme";
import Header from "@/components/shared/header";
import { Animated } from "react-native";
import Text from "@/components/shared/text";
import ProfileHeader from "@/components/profile/profile-header";
import { labelArr } from "@/constants/profile-data";
import ProfileLabel from "@/components/profile/profile-label";
import {
  FontAwesome6,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import MiniLoader from "@/components/shared/mini-loader";
import ModalPop from "@/components/shared/modal";
import Button from "@/components/shared/button";

const Profile = () => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [modalVisible, setModalVisible] = React.useState(false);

  const opacityTitle = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });
  const translateTitle = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 40],
    extrapolate: "clamp",
  });
  const { staff, logout } = useAuthStore();

  const {
    data: staffData,
    isLoading,
    error,
  } = profileQuery.useFetchStaffProfile(staff?.staffId as number);

  if (error) {
    return <Text>Error fetching data</Text>;
  }
  return (
    <ScreenWrapper
      statusBgColor={THEME.colors.brand}
      bgColor={THEME.colors.brand}
      barStyle="light-content"
    >
      <MiniLoader visible={isLoading} />
      <View
        style={[
          // styles.header,
          { backgroundColor: THEME.colors.brand, paddingBottom: 10 },
        ]}
      >
        <Header
          name={`Profile`}
          image={staff?.imageUrl!}
          opacityTitle={opacityTitle}
          translateTitle={translateTitle}
        />
      </View>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <ProfileHeader data={staffData!} />

          <View style={{ paddingVertical: 8, rowGap: THEME.spacing.sm }}>
            {labelArr.map((item, index) => (
              <ProfileLabel
                key={index} // Ensure a unique key for each item
                index={index} // Ensure a unique key for each item
                iconName={item.iconName}
                label={item.title}
                link={item.url}
                edit={item.edit}
                id={staffData?.staffId as number}
              />
            ))}
          </View>
          <TouchableWithoutFeedback onPress={() => setModalVisible(true)}>
            <View style={styles.butcontainer}>
              <View style={styles.label}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: THEME.colors.lightGray,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <MaterialCommunityIcons
                    name={"door-open"}
                    size={24}
                    color={THEME.colors.primary}
                  />
                </View>
                <Text style={styles.labelName} size="base" weight="semiBold">
                  {"Logout"}
                </Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={22}
                color={THEME.colors.red}
              />
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </View>
      <ModalPop
        modalVisible={modalVisible}
        closeModal={() => setModalVisible(false)}
        title=""
      >
        <View style={{ rowGap: THEME.spacing.sm }}>
          <View
            style={{
              justifyContent: "center",
              flexDirection: "row",
              padding: 15,
              alignSelf: "center",
              borderRadius: 90,
              backgroundColor: THEME.colors.lightGray,
              alignItems: "center",
            }}
          >
            <FontAwesome6 name="door-open" size={30} />
          </View>
          <Text size="xl" weight="bold" style={{ marginVertical: 5 }}>
            Logout?
          </Text>
          <Text
            size="md"
            weight="medium"
            style={{ marginBottom: 5, color: THEME.colors.neutral[300] }}
          >
            Are you sure you want to log out?
          </Text>

          <View style={[styles.buttonContainer]}>
            <Button
              containerStyle={{ flex: 1 }}
              variant="primary"
              onPress={() => setModalVisible(false)}
            >
              No
            </Button>

            <Button
              containerStyle={{ flex: 1 }}
              variant="secondary"
              onPress={logout}
            >
              Yes
            </Button>
          </View>
        </View>
      </ModalPop>
    </ScreenWrapper>
  );
};

export default Profile;

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: THEME.spacing.sm,
  },
  container: {
    flex: 1,
    backgroundColor: THEME.colors.white,
  },
  content: {
    rowGap: THEME.spacing.sm,
    backgroundColor: THEME.colors.white,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 10,
    paddingBottom: 5,
  },
  butcontainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  labelName: {
    color: THEME.colors.red,
  },
});
