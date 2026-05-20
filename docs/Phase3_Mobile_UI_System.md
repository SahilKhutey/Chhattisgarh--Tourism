# CG Tourism Platform — Phase 3: Mobile UI System & Frontend Architecture
## Expo Router navigation, React Native Zustand State, and Reanimated Spring Cards

---

## 1. Complete Production Zustand Store (`places.store.ts`)

For high-speed coordinates queries and local state caching across offline-first explorer panels:

```typescript
import { create } from 'zustand';

interface Place {
  id: string;
  name: string;
  slug: string;
  description: string;
  district: string;
  latitude: number;
  longitude: number;
  heroImage: string;
  distance_km?: number;
}

interface PlacesState {
  // 1. Data Collections
  places: Place[];
  selectedPlace: Place | null;
  loading: boolean;
  error: string | null;

  // 2. Active Search Filters
  searchQuery: string;
  activeCategory: string | null;
  activeDistrict: string | null;

  // 3. User GPS Telemetry
  userLocation: { latitude: number; longitude: number } | null;

  // 4. Action Dispatches
  setPlaces: (places: Place[]) => void;
  setSelectedPlace: (place: Place | null) => void;
  setFilters: (filters: { query?: string; category?: string | null; district?: string | null }) => void;
  setUserLocation: (location: { latitude: number; longitude: number } | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const usePlacesStore = create<PlacesState>((set) => ({
  places: [],
  selectedPlace: null,
  loading: false,
  error: null,
  searchQuery: '',
  activeCategory: null,
  activeDistrict: null,
  userLocation: null,

  setPlaces: (places) => set({ places }),
  setSelectedPlace: (place) => set({ selectedPlace: place }),
  setFilters: (filters) => set((state) => ({
    searchQuery: filters.query !== undefined ? filters.query : state.searchQuery,
    activeCategory: filters.category !== undefined ? filters.category : state.activeCategory,
    activeDistrict: filters.district !== undefined ? filters.district : state.activeDistrict,
  })),
  setUserLocation: (location) => set({ userLocation: location }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
```

---

## 2. Reanimated Spring Card Component (`TourismCard.tsx`)

To fulfill the Cinematic Transition rules on mobile viewports using **React Native Reanimated**:

```tsx
import React from 'react';
import { Pressable, Text, View, Image, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface TourismCardProps {
  name: string;
  district: string;
  heroImage: string;
  distanceKm?: number;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const TourismCard: React.FC<TourismCardProps> = ({
  name,
  district,
  heroImage,
  distanceKm,
  onPress,
}) => {
  const scale = useSharedValue(1);

  // Define spring dynamics matching cinematic motion profiles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value, { stiffness: 220, damping: 18 }) }],
  }));

  const handlePressIn = () => {
    scale.value = 0.975;
  };

  const handlePressOut = () => {
    scale.value = 1;
  };

  return (
    <AnimatedPressable
      style={[styles.card, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Image source={{ uri: heroImage }} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{name}</Text>
          <Text style={styles.tag}>{district}</Text>
        </View>
        {distanceKm !== undefined && (
          <Text style={styles.distance}>📍 {distanceKm.toFixed(1)} km away</Text>
        )}
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#1F4D3A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F4D3A',
  },
  tag: {
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: '#F4EFE6',
    color: '#C96B3B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  distance: {
    fontSize: 13,
    color: '#3A7CA5',
    fontWeight: '500',
  },
});
```

---

## 3. Expo Router Directory Routing Tree

```
app/
├── (auth)/
│   ├── login.tsx            # Login card layout with verification
│   └── register.tsx         # User registration form
├── (tabs)/
│   ├── home.tsx             # Immersive nature category slider
│   ├── explore.tsx          # Mapbox interactive cluster pins
│   ├── bookmarks.tsx        # Local MMKV cached bookmarks
│   └── profile.tsx          # Settings & contributor requests
├── place/
│   └── [slug].tsx           # Parallax detail pages with elder lore
├── creator/
│   ├── dashboard.tsx        # Verification and upload trackers
│   └── upload.tsx           # Coordinates & guidelines submitter
└── _layout.tsx              # Main slot wrapper with state provider
```
