import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Item } from "@/data/item";

export default function HomeScreen() {
  const aisleOrder = [
    "fridge",
    "freezer",
    "cupboard",
    "household",
    "pet",
    "misc",
  ];
  const [collapsedByAisle, setCollapsedByAisle] = useState<
    Record<string, boolean>
  >({
    fridge: true,
    freezer: true,
    cupboard: true,
    household: true,
    pet: true,
    misc: true,
  });

  const [items, setItems] = useState<Record<string, Item>>({
    milk: {
      id: "milk",
      name: "Milk",
      quantity: 1,
      needed: true,
      aisleId: "fridge",
      inCart: false,
    },
    tofu: {
      id: "tofu",
      name: "Tofu",
      quantity: 0,
      needed: true,
      aisleId: "fridge",
      inCart: false,
    },
    bread: {
      id: "bread",
      name: "Bread",
      quantity: 0,
      needed: true,
      aisleId: "cupboard",
      inCart: false,
    },
    detergent: {
      id: "detergent",
      name: "Detergent",
      quantity: 0,
      needed: true,
      aisleId: "household",
      inCart: false,
    },
    berries: {
      id: "berries",
      name: "Berries",
      quantity: 1,
      needed: true,
      aisleId: "freezer",
      inCart: false,
    },
    meatballs: {
      id: "meatballs",
      name: "Meatballs",
      quantity: 1,
      needed: true,
      aisleId: "pet",
      inCart: false,
    },
  });
  const [query, setQuery] = useState("");
  const [selectedAisle, setSelectedAisle] = useState("misc");

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

  /** Toggles the collapsed state of an aisle */
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

    setItems((prev) => {
      const existing = Object.values(prev).find(
        (item) => item.name.toLowerCase() === normalizedLower,
      );

      if (existing) {
        return {
          ...prev,
          [existing.id]: {
            ...existing,
            needed: true,
          },
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

  const normalizedQuery = normalizeInput(query);
  const shouldShowAislePicker =
    normalizedQuery.length > 0 &&
    !Object.values(items).some(
      (item) => item.name.toLowerCase() === normalizedQuery.toLowerCase(),
    );

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <Text style={styles.title}>Plan Your Shopping</Text>
        <TextInput
          style={styles.searchBar}
          placeholder="Search or add items..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleItemSubmit}
          returnKeyType="done"
        />
        {shouldShowAislePicker && (
          <View style={styles.aislePicker}>
            {aisleOrder.map((aisle) => {
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
        {aisleOrder.map((aisle) => (
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
                    style={({ pressed }) => [
                      styles.bulletItem,
                      pressed && { opacity: 0.6 },
                    ]}
                  >
                    <View style={styles.circleOuter}>
                      {item.needed && <View style={styles.circleInner} />}
                    </View>
                    <Text style={styles.itemText}>{item.name}</Text>
                  </Pressable>
                ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 16,
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  bullet: {
    fontSize: 18,
    marginRight: 8,
  },
  itemText: {
    fontSize: 18,
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
});
