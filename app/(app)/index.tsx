import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";

export default function Home() {
  const { isLoaded, userId, signOut } = useAuth();
  const { user } = useUser();

  if (!isLoaded || !user) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Welcome, {user.fullName || "User"}!</Text>
      {user.profileImageUrl && (
        <View style={styles.profileContainer}>
          <Text>Profile Picture:</Text>
          <img
            src={user.profileImageUrl}
            alt="Profile"
            style={styles.profileImage}
          />
        </View>
      )}
      <Button title="Logout" onPress={() => signOut()} />
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
