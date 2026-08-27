import { ImageBackground, StyleSheet, View , Image } from "react-native";
import React from "react";
import ScreenWrapper from "@/components/wrapper/screen-wrapper";
import HeaderWhite from "@/components/shared/header-no-bg";
import { THEME } from "@/constants/theme";
import useAuthStore from "@/store/use-auth-store";
import { profileQuery } from "@/hooks/queries/profile";
import Text from "@/components/shared/text";

const IdentityCard = () => {
  const { staff, user } = useAuthStore();

  const { data: staffData } = profileQuery.useFetchStaffProfile(
    staff?.staffId as number
  );
  const { data: companyData } = profileQuery.useFetchCompanyData(
    user?.companyId as number
  );
  return (
    <ScreenWrapper barStyle="dark-content">
      <HeaderWhite name={"Identity Card"} />
      <View style={styles.container}>
        <View style={styles.idContainer}>
          {companyData?.companyLogo && (
            <View style={styles.companyLogoCont}>
              <Image
                source={{ uri: companyData?.companyLogo }}
                resizeMode="contain"
                style={styles.companyLogo}
              />
            </View>
          )}
          <Image
            source={require("../../../assets/images/vectors/Vector.png")}
            style={styles.vector1}
          />
          <Image
            source={require("../../../assets/images/vectors/Vector2.png")}
            style={styles.vector2}
          />
          <Image
            source={require("../../../assets/images/vectors/Vector3.png")}
            style={styles.vector3}
          />
          <Image
            source={require("../../../assets/images/vectors/Vector4.png")}
            style={styles.vector4}
          />
          <Image
            source={require("../../../assets/images/vectors/Vector5.png")}
            style={styles.vector5}
          />
          <View style={styles.contentContainer}>
            <View style={styles.imageContainer}>
              <ImageBackground
                source={require("../../../assets/images/user-avatar.png")}
                style={styles.userImg}
                imageStyle={styles.userImg}
              >
                <Image
                  source={{ uri: staffData?.imageUrl }}
                  style={styles.userImg}
                  resizeMode="cover"
                />
              </ImageBackground>
              <Text weight="bold" size="xl" style={styles.title}>
                {staffData?.fullName}
              </Text>
              <Text style={styles.subtitle} weight="regular" size="md">
                {staffData?.email}
              </Text>
            </View>
            <View
              style={{
                marginTop: 20,
                gap: 8,
                justifyContent: "center",
              }}
            >
              <View style={styles.content}>
                <Text style={styles.contentLabel} weight="semiBold">
                  Staff ID:
                </Text>
                <Text>{staffData?.maxStaffId}</Text>
              </View>
              <View style={styles.content}>
                <Text style={styles.contentLabel} weight="semiBold">
                  Phone Number:
                </Text>
                <Text>{staffData?.phoneNumber}</Text>
              </View>
              <View style={styles.content}>
                <Text style={styles.contentLabel} weight="semiBold">
                  Gender:
                </Text>
                <Text>{staffData?.gender}</Text>
              </View>
              <View
                style={{
                  padding: 8,
                  marginTop: 10,
                  alignSelf: "center",
                  backgroundColor: THEME.colors.lightGray,
                  overflow: "hidden",
                  borderRadius: 5,
                }}
              >
                {staffData?.signatureUrl && (
                  <Image
                    source={{ uri: staffData?.signatureUrl }}
                    resizeMode="contain"
                    style={{
                      height: 50,
                      width: 140,
                      marginTop: 10,
                      alignSelf: "center",
                    }}
                  />
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default IdentityCard;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 30,
    paddingVertical: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  idContainer: {
    paddingTop: 60,
    paddingBottom: 5,
    borderWidth: 1,
    borderColor: THEME.colors.lightGray,
    // height: 517,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    overflow: "hidden",
    borderRadius: 5,
  },
  imageContainer: {
    gap: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  userImg: {
    width: 125,
    height: 124,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: THEME.colors.lightGray,
    overflow: "hidden",
  },
  contentContainer: {
    gap: 4,
    paddingVertical: 40,
  },
  vector1: {
    position: "absolute",
    top: -20,
    left: 0,
    zIndex: 10,
  },
  title: {
    color: THEME.colors.brand,
    textAlign: "center",
  },
  subtitle: {
    color: "#5C5C5C",
    textAlign: "center",
  },
  content: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 10,
  },
  contentLabel: {
    color: "#5C5C5C",
    alignSelf: "flex-start",
  },
  companyLogoCont: {
    padding: 4,
    marginTop: 10,
    justifyContent: "center",
    alignSelf: "center",
    backgroundColor: THEME.colors.light,
    overflow: "hidden",
    borderRadius: 5,
    position: "absolute",
    top: 0,
    left: 10,
    zIndex: 50,
  },
  companyLogo: {
    height: 40,
    width: 120,
    alignSelf: "center",
  },
  vector2: { position: "absolute", top: 0, right: 0 },
  vector3: { position: "absolute", bottom: 0, right: 0, zIndex: -10 },
  vector4: { position: "absolute", bottom: 0, left: 0 },
  vector5: { position: "absolute", bottom: 0, right: 0 },
});
