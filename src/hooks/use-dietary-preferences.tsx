import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface DietaryCategory {
  id: string;
  label: string;
  icon: string;
  items: DietaryOption[];
}

export interface DietaryOption {
  id: string;
  label: string;
  emoji: string;
}

export const DIETARY_CATEGORIES: DietaryCategory[] = [
  {
    id: "dietary-preference",
    label: "Dietary Preference",
    icon: "🥦",
    items: [
      { id: "vegetarian", label: "Vegetarian", emoji: "🥬" },
      { id: "vegan", label: "Vegan", emoji: "🌱" },
      { id: "pescatarian", label: "Pescatarian", emoji: "🐟" },
      { id: "flexitarian", label: "Flexitarian", emoji: "🥗" },
      { id: "plant-based", label: "Plant-based", emoji: "🌿" },
    ],
  },
  {
    id: "allergies",
    label: "Allergies",
    icon: "🚫",
    items: [
      { id: "peanuts", label: "Peanuts", emoji: "🥜" },
      { id: "tree-nuts", label: "Tree nuts", emoji: "🌰" },
      { id: "dairy", label: "Dairy", emoji: "🥛" },
      { id: "eggs", label: "Eggs", emoji: "🥚" },
      { id: "soy", label: "Soy", emoji: "🫘" },
      { id: "gluten", label: "Wheat / Gluten", emoji: "🌾" },
      { id: "fish", label: "Fish", emoji: "🐟" },
      { id: "shellfish", label: "Shellfish", emoji: "🦐" },
      { id: "sesame", label: "Sesame", emoji: "🫓" },
    ],
  },
  {
    id: "health-diets",
    label: "Health & Medical",
    icon: "🩺",
    items: [
      { id: "gluten-free", label: "Gluten-free", emoji: "🚫🌾" },
      { id: "low-fodmap", label: "Low-FODMAP", emoji: "🧪" },
      { id: "dairy-free", label: "Dairy-free", emoji: "🚫🥛" },
      { id: "low-sodium", label: "Low-sodium", emoji: "🧂" },
      { id: "low-sugar", label: "Low-sugar / Diabetic", emoji: "🍬" },
    ],
  },
  {
    id: "religious",
    label: "Religious / Cultural",
    icon: "🛕",
    items: [
      { id: "halal", label: "Halal", emoji: "☪️" },
      { id: "kosher", label: "Kosher", emoji: "✡️" },
      { id: "jain", label: "Jain diet", emoji: "🙏" },
      { id: "sattvic", label: "Sattvic diet", emoji: "🕉️" },
    ],
  },
  {
    id: "eco-focused",
    label: "Sustainability Goals",
    icon: "🌍",
    items: [
      { id: "low-carbon", label: "Low carbon footprint", emoji: "🦶" },
      { id: "locally-sourced", label: "Locally sourced", emoji: "📍" },
      { id: "seasonal", label: "Seasonal foods", emoji: "🗓️" },
      { id: "sustainable-seafood", label: "Sustainable seafood", emoji: "🎣" },
      { id: "organic", label: "Organic", emoji: "🌿" },
      { id: "minimal-packaging", label: "Minimal packaging", emoji: "📦" },
    ],
  },
];

interface DietaryPreferencesContextValue {
  selected: string[];
  toggle: (id: string) => void;
  isSelected: (id: string) => boolean;
  clear: () => void;
  count: number;
  getSummary: () => string;
}

const DietaryPreferencesContext = createContext<DietaryPreferencesContextValue | null>(null);

const STORAGE_KEY = "dietary-preferences";

export function DietaryPreferencesProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
  }, [selected]);

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const isSelected = (id: string) => selected.includes(id);
  const clear = () => setSelected([]);
  const count = selected.length;

  const getSummary = () => {
    if (count === 0) return "None";
    if (count <= 2) {
      const allItems = DIETARY_CATEGORIES.flatMap((c) => c.items);
      return selected.map((id) => allItems.find((i) => i.id === id)?.label ?? id).join(", ");
    }
    return `${count} selected`;
  };

  return (
    <DietaryPreferencesContext.Provider value={{ selected, toggle, isSelected, clear, count, getSummary }}>
      {children}
    </DietaryPreferencesContext.Provider>
  );
}

export function useDietaryPreferences() {
  const ctx = useContext(DietaryPreferencesContext);
  if (!ctx) throw new Error("useDietaryPreferences must be used within DietaryPreferencesProvider");
  return ctx;
}
