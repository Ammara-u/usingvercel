import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useEffect } from "react";

interface SealData {
  id: number;
  nameOfSeal: string;
  partCode: string;
  description: string;
  price: string;
  stock: string;
  minStock: string;
}

export default function EditSealPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sealData, setSealData] = useState<SealData>({
    id: 0,
    nameOfSeal: "",
    partCode: "",
    description: "",
    price: "",
    stock: "",
    minStock: "5"
  });

  const API_BASE_URL = "https://usingrender-x7yq.onrender.com";

  useEffect(() => {
    fetchSealDetails();
  }, [id]);

  const fetchSealDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/seals/${id}/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch seal details");
      }

      const data = await response.json();
      setSealData({
        id: data.id,
        nameOfSeal: data.nameOfSeal,
        partCode: String(data.partCode),
        description: data.description,
        price: String(data.price),
        stock: String(data.stock),
        minStock: String(data.minStock || 5)
      });
    } catch (err) {
      console.error("Error fetching seal:", err);
      Alert.alert("Error", "Failed to load seal details");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!sealData.nameOfSeal.trim()) {
      Alert.alert("Validation Error", "Seal name is required");
      return;
    }
    if (!sealData.partCode.trim()) {
      Alert.alert("Validation Error", "Part code is required");
      return;
    }
    if (!sealData.price || parseFloat(sealData.price) <= 0) {
      Alert.alert("Validation Error", "Please enter a valid price");
      return;
    }
    if (!sealData.stock || parseInt(sealData.stock) < 0) {
      Alert.alert("Validation Error", "Please enter a valid stock quantity");
      return;
    }

    const payload = {
      nameOfSeal: sealData.nameOfSeal.trim(),
      partCode: parseInt(sealData.partCode),
      description: sealData.description.trim(),
      price: parseFloat(sealData.price),
      stock: parseInt(sealData.stock),
      minStock: parseInt(sealData.minStock) || 5
    };

    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/seals/${id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Failed to update seal");
      }

      Alert.alert(
        "Success", 
        "Seal updated successfully",
        [
          {
            text: "OK",
            onPress: () => router.back()
          }
        ]
      );
    } catch (err) {
      console.error("Error updating seal:", err);
      Alert.alert("Error", "Failed to update seal. Please try again.");
    } finally {
      setSaving(false);
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
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>Edit Seal</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          {/* Seal Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Seal Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Hydraulic Rod Seal"
              placeholderTextColor="#525252"
              value={sealData.nameOfSeal}
              onChangeText={(text) => setSealData({ ...sealData, nameOfSeal: text })}
            />
          </View>

          {/* Part Code */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Part Code *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 100234"
              placeholderTextColor="#525252"
              keyboardType="numeric"
              value={sealData.partCode}
              onChangeText={(text) => setSealData({ ...sealData, partCode: text })}
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter a description for the seal"
              placeholderTextColor="#525252"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={sealData.description}
              onChangeText={(text) => setSealData({ ...sealData, description: text })}
            />
          </View>

          {/* Price */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Price (Rs) *</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#525252"
              keyboardType="decimal-pad"
              value={sealData.price}
              onChangeText={(text) => setSealData({ ...sealData, price: text })}
            />
          </View>

          {/* Stock */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current Stock *</Text>
            <TextInput
              style={styles.input}
              placeholder="Current quantity"
              placeholderTextColor="#525252"
              keyboardType="numeric"
              value={sealData.stock}
              onChangeText={(text) => setSealData({ ...sealData, stock: text })}
            />
          </View>

          {/* Min Stock */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, styles.minStockLabel]}>Minimum Stock Alert Level</Text>
            <TextInput
              style={[styles.input, styles.minStockInput]}
              placeholder="Alert me when stock is below..."
              placeholderTextColor="#525252"
              keyboardType="numeric"
              value={sealData.minStock}
              onChangeText={(text) => setSealData({ ...sealData, minStock: text })}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Pressable 
            style={({ pressed }) => [
              styles.cancelButton,
              pressed && { opacity: 0.7 }
            ]}
            onPress={() => router.back()}
            disabled={saving}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>

          <Pressable 
            style={({ pressed }) => [
              styles.saveButton,
              pressed && { opacity: 0.9 },
              saving && { opacity: 0.6 }
            ]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={styles.saveButtonText}>💾 Save Changes</Text>
            )}
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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#737373",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  minStockLabel: {
    color: "#38BDF8",
  },
  input: {
    backgroundColor: "rgba(23, 23, 23, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#FAFAFA",
  },
  minStockInput: {
    borderColor: "rgba(56, 189, 248, 0.3)",
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  actionButtons: {
    marginHorizontal: 20,
    marginBottom: 40,
    gap: 12,
  },
  cancelButton: {
    backgroundColor: "transparent",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#404040",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  saveButton: {
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
  saveButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "800",
  },
});