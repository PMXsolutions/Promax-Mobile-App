/**
 * A UAT install must not replace the store app.
 * EXPO_PUBLIC_CARE_OS_TEST stays off here: that flag refuses hosted UAT on purpose.
 */
function applyCareOsUatIdentity(expo, flag) {
  if (flag !== "1") return expo;
  const android = { ...(expo.android || {}), package: "com.tobby95.pmaxapp.uat" };
  delete android.googleServicesFile;
  return {
    ...expo,
    name: "Promax Care (UAT)",
    ios: { ...(expo.ios || {}), bundleIdentifier: "com.promax-app.uat" },
    android,
  };
}

module.exports = { applyCareOsUatIdentity };
