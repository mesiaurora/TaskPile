import { StyleSheet, Text, View } from "react-native";
import { useShopping } from "@/context/ShoppingContext";

export default function HomeScreen() {
  const { aisles, items } = useShopping();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TaskPile SHOP</Text>
      <Text style={styles.meta}>Aisles: {aisles.length}</Text>
      <Text style={styles.meta}>Items: {Object.keys(items).length}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
  },
  meta: {
    marginTop: 8,
    fontSize: 16,
  },
});
