import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useShopping } from "@/context/ShoppingContext";

export default function ShopScreen() {
  const { aisles, items, setItems } = useShopping();
  const [collapsedByAisle, setCollapsedByAisle] = useState<
    Record<string, boolean>
  >({});

  const toggleAisle = (aisle: string) => {
    setCollapsedByAisle((prev) => ({
      ...prev,
      [aisle]: !prev[aisle],
    }));
  };

  const toggleInCart = (id: string) => {
    setItems((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        inCart: !prev[id].inCart,
      },
    }));
  };

  const resetTrip = () => {
    Alert.alert("Reset trip?", "This will uncheck all items in your cart.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: () => {
          setItems((prev) => {
            const updated = { ...prev };
            Object.keys(updated).forEach((id) => {
              updated[id] = { ...updated[id], inCart: false };
            });
            return updated;
          });
        },
      },
    ]);
  };

  // Only aisles that have at least one needed item
  const activeAisles = aisles.filter((aisle) =>
    Object.values(items).some((item) => item.aisleId === aisle && item.needed),
  );

  const totalNeeded = Object.values(items).filter((i) => i.needed).length;
  const totalInCart = Object.values(items).filter(
    (i) => i.needed && i.inCart,
  ).length;
  const allDone = totalNeeded > 0 && totalInCart === totalNeeded;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.containerContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.contentWrapper}>
        <Text style={styles.pageTitle}>GO SHOPPING</Text>

        {/* Progress indicator */}
        {totalNeeded > 0 && (
          <View style={styles.progressRow}>
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${(totalInCart / totalNeeded) * 100}%` },
                  allDone && styles.progressBarDone,
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {totalInCart}/{totalNeeded}
            </Text>
          </View>
        )}

        {allDone && (
          <Text style={styles.doneMessage}>🎉 All done! Great job.</Text>
        )}

        {activeAisles.length === 0 && (
          <Text style={styles.emptyText}>
            No items on your list yet.{"\n"}Head to Plan to add some!
          </Text>
        )}

        {activeAisles.map((aisle) => {
          const aisleItems = Object.values(items).filter(
            (item) => item.aisleId === aisle && item.needed,
          );
          const aisleChecked = aisleItems.filter((i) => i.inCart).length;
          const aisleAllDone = aisleChecked === aisleItems.length;
          const isCollapsed = collapsedByAisle[aisle];

          return (
            <View style={styles.aisleContainer} key={aisle}>
              <Pressable onPress={() => toggleAisle(aisle)}>
                <View style={styles.headerRow}>
                  <Text
                    style={[
                      styles.aisleHeader,
                      aisleAllDone && styles.aisleHeaderDone,
                    ]}
                  >
                    {aisle.toUpperCase()}
                  </Text>
                  <Text style={styles.aisleCount}>
                    {aisleChecked}/{aisleItems.length}
                  </Text>
                  <Text style={styles.chevron}>{isCollapsed ? "▸" : "▾"}</Text>
                </View>
              </Pressable>

              {!isCollapsed &&
                aisleItems.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => toggleInCart(item.id)}
                    style={({ pressed }) => [
                      styles.bulletItem,
                      pressed && { opacity: 0.5 },
                    ]}
                  >
                    {/* Checkbox */}
                    <View
                      style={[
                        styles.checkbox,
                        item.inCart && styles.checkboxChecked,
                      ]}
                    >
                      {item.inCart && <Text style={styles.checkmark}>✓</Text>}
                    </View>

                    <Text
                      style={[
                        styles.itemText,
                        item.inCart && styles.itemTextDone,
                      ]}
                    >
                      {item.name}
                      {item.quantity > 1 ? (
                        <Text style={styles.quantity}> ×{item.quantity}</Text>
                      ) : null}
                    </Text>
                  </Pressable>
                ))}
            </View>
          );
        })}

        {totalNeeded > 0 && (
          <Pressable style={styles.resetButton} onPress={resetTrip}>
            <Text style={styles.resetButtonText}>Reset Trip</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerContent: {
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 48,
  },
  contentWrapper: {
    width: "92%",
    maxWidth: 520,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "bold",
    padding: 8,
    marginBottom: 12,
  },

  // Progress bar
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 10,
  },
  progressBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#000",
    borderRadius: 4,
  },
  progressBarDone: {
    backgroundColor: "#4caf50",
  },
  progressText: {
    fontSize: 14,
    color: "#666",
    minWidth: 36,
    textAlign: "right",
  },

  doneMessage: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginVertical: 16,
  },
  emptyText: {
    fontSize: 17,
    color: "#888",
    textAlign: "center",
    marginTop: 60,
    lineHeight: 26,
  },

  // Aisles
  aisleContainer: {
    marginBottom: 16,
    marginTop: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  aisleHeader: {
    flex: 1,
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 16,
  },
  aisleHeaderDone: {
    color: "#aaa",
  },
  aisleCount: {
    fontSize: 14,
    color: "#888",
    marginTop: 16,
    marginRight: 8,
  },
  chevron: {
    fontSize: 18,
    marginTop: 16,
  },

  // Items
  bulletItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    paddingVertical: 4,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  checkboxChecked: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  checkmark: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
    lineHeight: 18,
  },
  itemText: {
    fontSize: 20,
  },
  itemTextDone: {
    textDecorationLine: "line-through",
    color: "#aaa",
  },
  quantity: {
    fontSize: 16,
    color: "#666",
  },

  // Reset
  resetButton: {
    marginTop: 32,
    borderWidth: 1.5,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  resetButtonText: {
    fontSize: 16,
    color: "#888",
  },
});
