import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useEffect } from "react";

interface SealDetail {
  id: number;
  partCode: number;
  description: string;
  price: number;
  stock: number;
  minStock: number;
}

export default function SealDetailPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [seal, setSeal] = useState<SealDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE_URL = "https://usingrender-x7yq.onrender.com";

  useEffect(() => {
    fetchSealDetails();
  }, [id]);

  const fetchSealDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/seals/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch seal details");
      }

      const data = await response.json();
      setSeal(data);
    } catch (err) {
      console.error("Error fetching seal:", err);
      setError("Failed to load seal details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={["#0A0A0A", "#171717", "#0A0A0A"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F59E0B" />
          <Text style={styles.loadingText}>Loading seal details...</Text>
        </View>
      </View>
    );
  }

  if (error || !seal) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={["#0A0A0A", "#171717", "#0A0A0A"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || "Seal not found"}</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const stockStatus = seal.stock <= seal.minStock ? "Low Stock" : "In Stock";
  const stockColor = seal.stock <= seal.minStock ? "#EF4444" : "#10B981";

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0A0A0A", "#171717", "#0A0A0A"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Glow effects */}
      <View style={[styles.circle, styles.circleTop]} />
      <View style={[styles.circle, styles.circleBottom]} />

      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButtonSmall}>
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Seal Details</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Main Card */}
        <View style={styles.card}>
          {/* Details Grid */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Part Code</Text>
              <Text style={styles.value}>#{seal.partCode}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Price</Text>
              <Text style={styles.priceValue}>Rs {seal.price}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Stock</Text>
              <View style={styles.stockBadge}>
                <Text style={[styles.stockValue, { color: stockColor }]}>
                  {seal.stock} units
                </Text>
                <Text style={[styles.stockStatus, { color: stockColor }]}>
                  {stockStatus}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Min Stock</Text>
              <Text style={styles.value}>{seal.minStock} units</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Description */}
          <View>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.description}>{seal.description}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Pressable 
            style={({ pressed }) => [
              styles.editButton,
              pressed && { opacity: 0.7 }
            ]}
            onPress={() => {
              router.push(`/edit-seal?id=${seal.id}`);
            }}
          >
            <Text style={styles.editButtonText}>✏️ Edit Seal</Text>
          </Pressable>

          <Pressable 
            style={({ pressed }) => [
              styles.recordSaleButton,
              
              pressed && { opacity: 0.9 }
            ]}
            onPress={() => {
              // Navigate to sales page
              router.push("/sales");
            }}
          >
            <Text style={styles.recordSaleButtonText}>📊 Record Sale</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  circle: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: 200,
    opacity: 0.15,
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
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#A3A3A3",
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButtonSmall: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backArrow: {
    fontSize: 28,
    color: "#F59E0B",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FAFAFA",
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 24,
    borderRadius: 24,
    backgroundColor: "rgba(38, 38, 38, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  sealName: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FAFAFA",
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginVertical: 20,
  },
  detailsGrid: {
    gap: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#737373",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FAFAFA",
  },
  priceValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#F59E0B",
  },
  stockBadge: {
    alignItems: "flex-end",
  },
  stockValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  stockStatus: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  description: {
    fontSize: 15,
    color: "#A3A3A3",
    lineHeight: 22,
    marginTop: 8,
  },
  actionButtons: {
    marginHorizontal: 20,
    marginBottom: 40,
    gap: 12,
  },
  editButton: {
    backgroundColor: "transparent",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#404040",
    alignItems: "center",
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  recordSaleButton: {
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
  recordSaleButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "800",
  },
  backButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#F59E0B",
    borderRadius: 8,
  },
  backButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "700",
  },
});