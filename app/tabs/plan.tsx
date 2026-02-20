import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Item } from '@/data/item';


export default function HomeScreen() {
  const [items, setItems] = useState<Record<string, Item>>({
    milk: { id: 'milk', name: 'Milk', quantity: 1, needed: true, aisleId: '', inCart: false },
    tofu: { id: 'tofu', name: 'Tofu', quantity: 1, needed: true, aisleId: '', inCart: false },
  });

  const toggleNeeded = (id: string) => {
    setItems(prev => ({
        ...prev,
        [id]: {
        ...prev[id],
        needed: !prev[id].needed
        }
    }))
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TaskPile Plan Shopping</Text>
        {Object.values(items).map((item) => (
            <Pressable key={item.name} onPress={() => toggleNeeded(item.id)}>
              <Text>
                {item.needed ? "✓" : "•"} {item.name}
            </Text>
            </Pressable>
        ))}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  bullet: {
    fontSize: 18,
    marginRight: 8,
  },
  itemText: {
    fontSize: 18,
  },
});
