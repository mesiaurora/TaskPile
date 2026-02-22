import { Stack } from "expo-router";
import { ShoppingProvider } from "@/context/ShoppingContext";

export default function RootLayout() {
  return (
    <ShoppingProvider>
      <Stack>
        <Stack.Screen name="tabs" options={{ headerShown: false }} />
      </Stack>
    </ShoppingProvider>
  );
}
