import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../src/context/auth";
import { colors } from "../src/lib/theme";

/**
 * Landing route for the sign-in redirect (shopng://auth, exp://…/--/auth).
 * Normally the auth session captures that URL; on some devices it arrives as a
 * deep link instead, so we accept the token here and return to where the user was.
 */
export default function AuthCallback() {
  const { token, name, email } = useLocalSearchParams<{ token?: string; name?: string; email?: string }>();
  const { completeSignIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    completeSignIn({ token, name, email }).finally(() => {
      if (router.canGoBack()) router.back();
      else router.replace("/");
    });
  }, [token, name, email, completeSignIn, router]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color={colors.brand} size="large" />
    </View>
  );
}
