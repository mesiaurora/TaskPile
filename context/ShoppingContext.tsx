import {
  createContext,
  useEffect,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Item } from "@/data/item";
import { initialAisles } from "@/data/aisles";

type ShoppingContextValue = {
  aisles: string[];
  setAisles: Dispatch<SetStateAction<string[]>>;
  items: Record<string, Item>;
  setItems: Dispatch<SetStateAction<Record<string, Item>>>;
};

const ShoppingContext = createContext<ShoppingContextValue | undefined>(undefined);
const AISLES_STORAGE_KEY = "@taskpile/aisles";
const ITEMS_STORAGE_KEY = "@taskpile/items";

export function ShoppingProvider({ children }: { children: ReactNode }) {
  const [aisles, setAisles] = useState<string[]>(initialAisles);
  const [items, setItems] = useState<Record<string, Item>>({});
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const hydrateShoppingState = async () => {
      try {
        const entries = await AsyncStorage.multiGet([
          AISLES_STORAGE_KEY,
          ITEMS_STORAGE_KEY,
        ]);
        const aislesEntry = entries.find(([key]) => key === AISLES_STORAGE_KEY)?.[1];
        const itemsEntry = entries.find(([key]) => key === ITEMS_STORAGE_KEY)?.[1];

        if (aislesEntry) {
          const parsedAisles: unknown = JSON.parse(aislesEntry);
          if (
            Array.isArray(parsedAisles) &&
            parsedAisles.every((value) => typeof value === "string")
          ) {
            setAisles(parsedAisles);
          }
        }

        if (itemsEntry) {
          const parsedItems: unknown = JSON.parse(itemsEntry);
          if (
            parsedItems &&
            typeof parsedItems === "object" &&
            !Array.isArray(parsedItems)
          ) {
            setItems(parsedItems as Record<string, Item>);
          }
        }
      } catch (error) {
        console.warn("Failed to load shopping state", error);
      } finally {
        if (isMounted) {
          setHasHydrated(true);
        }
      }
    };

    void hydrateShoppingState();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    const persistShoppingState = async () => {
      try {
        await AsyncStorage.multiSet([
          [AISLES_STORAGE_KEY, JSON.stringify(aisles)],
          [ITEMS_STORAGE_KEY, JSON.stringify(items)],
        ]);
      } catch (error) {
        console.warn("Failed to persist shopping state", error);
      }
    };

    void persistShoppingState();
  }, [aisles, items, hasHydrated]);

  return (
    <ShoppingContext.Provider value={{ aisles, setAisles, items, setItems }}>
      {children}
    </ShoppingContext.Provider>
  );
}

export function useShopping() {
  const context = useContext(ShoppingContext);
  if (!context) {
    throw new Error("useShopping must be used within a ShoppingProvider");
  }
  return context;
}
