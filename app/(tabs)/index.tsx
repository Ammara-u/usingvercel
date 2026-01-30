import { View, Text, Pressable, StyleSheet, Image, TextInput, Modal, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";

export default function Index() {
  const router = useRouter();
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Sample data for search results
  const searchData = [
    { id: '1', title: 'Inventory Management', category: 'Feature', route: '/inventory' },
    { id: '2', title: 'Sales Dashboard', category: 'Feature', route: '/sales' },
    { id: '3', title: 'Product Catalog', category: 'Inventory', route: '/inventory' },
    { id: '4', title: 'Sales Reports', category: 'Reports', route: '/sales' },
    { id: '5', title: 'Stock Levels', category: 'Inventory', route: '/inventory' },
    { id: '6', title: 'Customer Orders', category: 'Sales', route: '/sales' },
  ];

  // Filter results based on search query
  const filteredResults = searchData.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchItemPress = (route: string) => {
    setSearchVisible(false);
    setSearchQuery("");
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
        onRequestClose={() => setSearchVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable 
            style={styles.modalBackdrop} 
            onPress={() => setSearchVisible(false)}
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
                  placeholder="Search features, inventory, sales..."
                  placeholderTextColor="#737373"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus={true}
                />
              </View>
              <Pressable 
                onPress={() => setSearchVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>

            {/* Search Results */}
            <View style={styles.searchResults}>
              {searchQuery === "" ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    Start typing to search...
                  </Text>
                </View>
              ) : filteredResults.length > 0 ? (
                <FlatList
                  data={filteredResults}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <Pressable
                      style={({ pressed }) => [
                        styles.searchResultItem,
                        pressed && { backgroundColor: "rgba(245, 158, 11, 0.1)" }
                      ]}
                      onPress={() => handleSearchItemPress(item.route)}
                    >
                      <View>
                        <Text style={styles.resultTitle}>{item.title}</Text>
                        <Text style={styles.resultCategory}>{item.category}</Text>
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
});
