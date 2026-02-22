import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="plan" options={{ title: "Plan your shopping" }} />
      <Tabs.Screen name="shop" options={{ title: "Go shopping" }} />
    </Tabs>
  );
}
