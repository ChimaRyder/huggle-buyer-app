import React from "react";
import { View, Text, Button, StyleSheet, Image, Alert } from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";

export default function Home() {
  const { isLoaded, userId, signOut } = useAuth();
  const { user, isSignedIn } = useUser();

  console.log("Auth status: ", isSignedIn);
  console.log("JWT: ", userId);

  if (!isLoaded || !user) {
    return <Text>Loading...</Text>;
  }

  const handleLogout = async () => {
    try {
      console.log("User requested logout");
      await signOut();
      console.log("User successfully logged out");
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Logout Error", "An error occurred while logging out. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Welcome, {user.fullName || "User"}!</Text>
      {user.imageUrl && (
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: user.imageUrl }}
            style={styles.profileImage}
            resizeMode="cover"
          />
        </View>
      )}
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  greeting: {
    fontSize: 20,
    marginBottom: 16,
  },
  profileContainer: {
    marginBottom: 16,
    alignItems: "center",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 8,
  },
});
