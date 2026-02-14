import { View, Text, Pressable, StyleSheet, Image, TextInput, Modal, FlatList, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useEffect } from "react";

// Define the structure of search result items
interface SearchResult {
  id: string | number;
  title: string;
  category: string;
  route: string;
}

export default function Index() {
  const router = useRouter();
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Replace with your actual backend API endpoint
  const API_BASE_URL = "https://usingrender-x7yq.onrender.com/";

  // Debounce search to avoid excessive API calls
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      fetchSearchResults(searchQuery);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const fetchSearchResults = async (query: string) => {
    setIsLoading(true);
    setError("");

    try {
      // fetch(`${API_BASE_URL}/seals/search/?q=${encodeURIComponent(query)}`)

      const response = await fetch(`${API_BASE_URL}/seals/search/?q=${encodeURIComponent(query)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Add authentication token if required
          // "Authorization": `Bearer ${yourAuthToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch search results");
      }

      const data = await response.json();
      
      // Assuming the API returns an array of results
      // Adjust based on your actual API response structure
      const results: SearchResult[] = data.results || data;
      setSearchResults(results);
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to fetch results. Please try again.");
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchItemPress = (route: string) => {
    setSearchVisible(false);
    setSearchQuery("");
    setSearchResults([]);
    router.push(route);
  };

  return (
    <View style={styles.container}>
      {/* 1. Deep Neutral Background */}
      <LinearGradient
        colors={["#0A0A0A", "#171717", "#0A0A0A"]}
        style={StyleSheet.absoluteFill}
      />

      {/* 2. Soft "Industrial Glow" Elements */}
      <View style={[styles.circle, styles.circleTop]} />
      <View style={[styles.circle, styles.circleBottom]} />

      {/* Navbar */}
      <View style={styles.navbar}>
        <View>
          <Text style={styles.logo}>
            EAGLE <Text style={{ color: "#F59E0B" }}>ENG.</Text>
          </Text>
          <Text style={styles.logoSub}>Work Management System</Text>
        </View>
        
        <Pressable 
          style={styles.navItems}
          onPress={() => setSearchVisible(true)}
        >
          <Image
            source={require("../../assets/images/search_3856329.png")}
            style={{ width: 24, height: 24 }}
          />
          <Text style={styles.navText}>Search</Text>
        </Pressable>
      </View>

      {/* Hero Section */}
      <View style={styles.hero}>
        <View style={styles.glassCard}>
          <Text style={styles.heading}>Engineering Operations, Simplified</Text>

          <Text style={styles.subheading}>
            Manage inventory, track sales, and search records with
            precision-engineered tools.
          </Text>

          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.9 }]}
              onPress={() => router.push("/inventory")}
            >
              <Text style={styles.primaryButtonText}>Manage Inventory</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.secondaryButton, pressed && { opacity: 0.7 }]}
              onPress={() => router.push("/sales")}
            >
              <Text style={styles.secondaryButtonText}>View Sales</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Search Modal */}
      <Modal
        visible={searchVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setSearchVisible(false);
          setSearchQuery("");
          setSearchResults([]);
        }}
      >
        <View style={styles.modalOverlay}>
          <Pressable 
            style={styles.modalBackdrop} 
            onPress={() => {
              setSearchVisible(false);
              setSearchQuery("");
              setSearchResults([]);
            }}
          />
          
          <View style={styles.searchContainer}>
            {/* Search Header */}
            <View style={styles.searchHeader}>
              <View style={styles.searchInputContainer}>
                <Image
                  source={require("../../assets/images/search_3856329.png")}
                  style={{ width: 20, height: 20, tintColor: "#A3A3A3" }}
                />
               <TextInput
  style={styles.searchInput}
  placeholder="Search by Name or ID (e.g. 101)..." // Updated placeholder
  placeholderTextColor="#737373"
  keyboardType="default" // Keeps it flexible for name or ID
  value={searchQuery}
  onChangeText={setSearchQuery}
  autoFocus={true}
/>
              </View>
              <Pressable 
                onPress={() => {
                  setSearchVisible(false);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>

            {/* Search Results */}
            <View style={styles.searchResults}>
              {isLoading ? (
                <View style={styles.emptyState}>
                  <ActivityIndicator size="large" color="#F59E0B" />
                  <Text style={[styles.emptyStateText, { marginTop: 12 }]}>
                    Searching...
                  </Text>
                </View>
              ) : error ? (
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyStateText, { color: "#EF4444" }]}>
                    {error}
                  </Text>
                  <Pressable
                    style={styles.retryButton}
                    onPress={() => fetchSearchResults(searchQuery)}
                  >
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </Pressable>
                </View>
              ) : searchQuery === "" ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    Start typing to search...
                  </Text>
                </View>
              ) : searchResults.length > 0 ? (
                <FlatList
  data={searchResults}
  keyExtractor={(item) => item.id.toString()}
  renderItem={({ item }) => (
    <Pressable
      style={({ pressed }) => [
        styles.searchResultItem,
        pressed && { backgroundColor: "rgba(245, 158, 11, 0.1)" }
      ]}
      onPress={() => handleSearchItemPress(item.route)}
    >
      <View>
        {/* Shows the Title (Name or ID) */}
        <Text style={styles.resultTitle}>{item.title}</Text>
        
        {/* Displays the Part Code/Category */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={[styles.resultCategory, { color: '#F59E0B' }]}>
            Code: {item.category}
          </Text>
        </View>
      </View>
      <Text style={styles.resultArrow}>→</Text>
    </Pressable>
  )}
/>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    No results found for "{searchQuery}"
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  /* Industrial Glow */
  circle: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: 200,
    opacity: 0.15,
  },
  navItems: { 
    flexDirection: "row", 
    gap: 8, 
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  circleTop: {
    top: -150,
    right: -100,
    backgroundColor: "#F59E0B",
  },
  circleBottom: {
    bottom: -150,
    left: -100,
    backgroundColor: "#7C3AED",
  },

  /* Navbar */
  navbar: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  logoSub: {
    fontSize: 10,
    color: "#737373",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  navText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#F59E0B",
    textTransform: "uppercase",
  },

  /* Hero & Glass Card */
  hero: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  glassCard: {
    width: "100%",
    padding: 32,
    borderRadius: 32,
    backgroundColor: "rgba(38, 38, 38, 0.4)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
  },
  heading: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FAFAFA",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 38,
  },
  subheading: {
    fontSize: 16,
    color: "#A3A3A3",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
  },

  /* Buttons */
  buttonRow: {
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#F59E0B",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 8,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  primaryButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#404040",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  /* Search Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  searchContainer: {
    marginTop: 60,
    marginHorizontal: 20,
    backgroundColor: "rgba(23, 23, 23, 0.98)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    maxHeight: "80%",
    overflow: "hidden",
  },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(38, 38, 38, 0.6)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  closeButton: {
    marginLeft: 12,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    color: "#A3A3A3",
    fontSize: 24,
    fontWeight: "300",
  },
  searchResults: {
    maxHeight: 400,
  },
  searchResultItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  resultTitle: {
    color: "#FAFAFA",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  resultCategory: {
    color: "#737373",
    fontSize: 13,
    fontWeight: "500",
  },
  resultArrow: {
    color: "#F59E0B",
    fontSize: 20,
    fontWeight: "600",
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyStateText: {
    color: "#737373",
    fontSize: 15,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#F59E0B",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "700",
  },
});