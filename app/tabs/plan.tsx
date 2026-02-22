import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Item } from "@/data/item";
import { useShopping } from "@/context/ShoppingContext";

export default function HomeScreen() {
  const { aisles, setAisles, items, setItems } = useShopping();
  const [collapsedByAisle, setCollapsedByAisle] = useState<
    Record<string, boolean>
  >({});
  const [query, setQuery] = useState("");
  const [selectedAisle, setSelectedAisle] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  // Tracks which items have their quantity stepper expanded
  const [expandedQtyIds, setExpandedQtyIds] = useState<Record<string, boolean>>(
    {},
  );

  const toggleQtyExpanded = (id: string) => {
    setExpandedQtyIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const normalizeInput = (value: string) => value.trim().replace(/\s+/g, " ");

  const toggleNeeded = (id: string) => {
    setItems((prev) => {
      const item = prev[id];
      const newNeeded = !item.needed;
      return {
        ...prev,
        [id]: {
          ...item,
          needed: newNeeded,
          quantity: newNeeded ? (item.quantity > 0 ? item.quantity : 1) : 0,
        },
      };
    });
  };

  const changeQuantity = (id: string, delta: number) => {
    setItems((prev) => {
      const item = prev[id];
      const newQty = Math.max(1, item.quantity + delta);
      return {
        ...prev,
        [id]: { ...item, quantity: newQty },
      };
    });
  };

  const toggleAisle = (aisle: string) => {
    setCollapsedByAisle((prev) => ({
      ...prev,
      [aisle]: !prev[aisle],
    }));
  };

  const handleItemSubmit = () => {
    const normalized = normalizeInput(query);
    if (!normalized) {
      setQuery("");
      return;
    }

    const normalizedLower = normalized.toLowerCase();
    if (!selectedAisle) {
      Alert.alert("No aisle selected", "Add an aisle first, then pick it.");
      return;
    }

    if (editingItemId) {
      setItems((prev) => {
        const current = prev[editingItemId];
        if (!current) return prev;
        return {
          ...prev,
          [editingItemId]: {
            ...current,
            name: normalized,
            aisleId: selectedAisle,
          },
        };
      });
      setEditingItemId(null);
      setQuery("");
      return;
    }

    setItems((prev) => {
      const existing = Object.values(prev).find(
        (item) => item.name.toLowerCase() === normalizedLower,
      );

      if (existing) {
        return {
          ...prev,
          [existing.id]: { ...existing, needed: true },
        };
      }

      const id =
        normalizedLower.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") ||
        normalizedLower;

      return {
        ...prev,
        [id]: {
          id,
          name: normalized,
          aisleId: selectedAisle,
          quantity: 1,
          needed: true,
          inCart: false,
        },
      };
    });

    setQuery("");
  };

  const addAisle = (aisle: string) => {
    const normalized = normalizeInput(aisle);
    if (!normalized) return;
    setAisles((prev: string[]) => {
      const alreadyExists = prev.some(
        (existing) => existing.toLowerCase() === normalized.toLowerCase(),
      );
      return alreadyExists ? prev : [...prev, normalized];
    });
  };

  useEffect(() => {
    if (aisles.length === 0) {
      if (selectedAisle) setSelectedAisle("");
      return;
    }
    if (!selectedAisle || !aisles.includes(selectedAisle)) {
      setSelectedAisle(aisles[0]);
    }
  }, [aisles, selectedAisle]);

  const normalizedQuery = normalizeInput(query);
  const shouldShowAislePicker =
    aisles.length > 0 &&
    (editingItemId !== null ||
      (normalizedQuery.length > 0 &&
        !Object.values(items).some(
          (item) => item.name.toLowerCase() === normalizedQuery.toLowerCase(),
        )));

  const deleteItem = (id: string) => {
    setItems((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    if (editingItemId === id) {
      setEditingItemId(null);
      setQuery("");
    }
  };

  const startEdit = (item: Item) => {
    setEditingItemId(item.id);
    setQuery(item.name);
    setSelectedAisle(item.aisleId);
  };

  const onItemLongPress = (item: Item) => {
    Alert.alert(item.name, "Choose an action", [
      { text: "Edit", onPress: () => startEdit(item) },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteItem(item.id),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.containerContent}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid
      extraScrollHeight={24}
    >
      <View style={styles.contentWrapper}>
        <Text style={styles.pageTitle}>PLAN YOUR SHOP</Text>
        <Text style={styles.title}>Add new Item</Text>
        <TextInput
          style={styles.searchBar}
          placeholder={
            editingItemId ? "Edit item..." : "Search or add items..."
          }
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleItemSubmit}
          returnKeyType="done"
        />

        {shouldShowAislePicker && (
          <View style={styles.aislePicker}>
            {aisles.map((aisle) => {
              const isSelected = selectedAisle === aisle;
              return (
                <Pressable
                  key={aisle}
                  onPress={() => setSelectedAisle(aisle)}
                  style={[
                    styles.aisleChip,
                    isSelected && styles.aisleChipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.aisleChipText,
                      isSelected && styles.aisleChipTextSelected,
                    ]}
                  >
                    {aisle}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {aisles.map((aisle) => (
          <View style={styles.aisleContainer} key={aisle}>
            <Pressable onPress={() => toggleAisle(aisle)}>
              <View style={styles.headerRow}>
                <Text style={styles.aisleHeader}>{aisle.toUpperCase()}</Text>
                <Text style={styles.chevron}>
                  {collapsedByAisle[aisle] ? "▸" : "▾"}
                </Text>
              </View>
            </Pressable>

            {!collapsedByAisle[aisle] &&
              Object.values(items)
                .filter((item) => item.aisleId === aisle)
                .map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => toggleNeeded(item.id)}
                    onLongPress={() => onItemLongPress(item)}
                    style={({ pressed }) => [
                      styles.bulletItem,
                      pressed && { opacity: 0.6 },
                    ]}
                  >
                    {/* Needed toggle */}
                    <View style={styles.circleOuter}>
                      {item.needed && <View style={styles.circleInner} />}
                    </View>

                    {/* Item name */}
                    <Text style={styles.itemText}>{item.name}</Text>

                    {/* Quantity — opt-in stepper */}
                    {item.needed && (
                      <View style={styles.stepper}>
                        {expandedQtyIds[item.id] ? (
                          <>
                            <Pressable
                              onPress={(e) => {
                                e.stopPropagation?.();
                                changeQuantity(item.id, -1);
                              }}
                              hitSlop={8}
                              style={({ pressed }) => [
                                styles.stepperBtn,
                                pressed && styles.stepperBtnPressed,
                              ]}
                            >
                              <Text style={styles.stepperBtnText}>−</Text>
                            </Pressable>

                            <Pressable
                              onPress={(e) => {
                                e.stopPropagation?.();
                                toggleQtyExpanded(item.id);
                              }}
                              hitSlop={8}
                            >
                              <Text style={styles.stepperValue}>
                                {item.quantity}
                              </Text>
                            </Pressable>

                            <Pressable
                              onPress={(e) => {
                                e.stopPropagation?.();
                                changeQuantity(item.id, 1);
                              }}
                              hitSlop={8}
                              style={({ pressed }) => [
                                styles.stepperBtn,
                                pressed && styles.stepperBtnPressed,
                              ]}
                            >
                              <Text style={styles.stepperBtnText}>+</Text>
                            </Pressable>
                          </>
                        ) : (
                          <Pressable
                            onPress={(e) => {
                              e.stopPropagation?.();
                              toggleQtyExpanded(item.id);
                            }}
                            hitSlop={8}
                            style={styles.qtyPill}
                          >
                            <Text style={styles.qtyPillText}>
                              {item.quantity > 1 ? `×${item.quantity}` : "qty"}
                            </Text>
                          </Pressable>
                        )}
                      </View>
                    )}
                  </Pressable>
                ))}
          </View>
        ))}

        <Text style={styles.title}>Add New Aisle</Text>
        <TextInput
          style={styles.searchBar}
          placeholder="Add new aisle..."
          onSubmitEditing={(e) => addAisle(e.nativeEvent.text)}
        />
      </View>
    </KeyboardAwareScrollView>
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
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    marginTop: 24,
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
    minHeight: 36,
  },
  itemText: {
    fontSize: 18,
    flex: 1,
  },
  aisleHeader: {
    flex: 1,
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 16,
  },
  contentWrapper: {
    width: "92%",
    maxWidth: 520,
  },
  aisleContainer: {
    marginBottom: 16,
    marginTop: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  chevron: {
    fontSize: 18,
  },
  circleOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    flexShrink: 0,
  },
  circleInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#000",
  },
  searchBar: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  aislePicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
    marginBottom: 8,
  },
  aisleChip: {
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  aisleChipSelected: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  aisleChipText: {
    fontSize: 13,
    textTransform: "capitalize",
    color: "#333",
  },
  aisleChipTextSelected: {
    color: "#fff",
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "bold",
    padding: 8,
  },

  qtyPill: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  qtyPillText: {
    fontSize: 13,
    color: "#888",
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginLeft: 8,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperBtnPressed: {
    backgroundColor: "#f0f0f0",
  },
  stepperBtnText: {
    fontSize: 18,
    lineHeight: 20,
    color: "#333",
  },
  stepperValue: {
    fontSize: 16,
    minWidth: 28,
    textAlign: "center",
    fontWeight: "600",
  },
});
