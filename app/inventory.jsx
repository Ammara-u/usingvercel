import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  StatusBar,
  Alert,
  Dimensions
} from "react-native";
import { Stack } from "expo-router";

const BASE_URL = "https://usingrender-x7yq.onrender.com";
const { width } = Dimensions.get('window');
const isSmallScreen = width < 400;

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sellModalVisible, setSellModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [restockModalVisible, setRestockModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState("1");
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);

  const [newItem, setNewItem] = useState({
    partCode: "",
    description: "",
    price: "",
    stock: "",
    minStock: "500"
  });

  const handleDeleteSeal = (item) => {
    console.log("Delete button clicked for:", item);
    setSelectedItem(item);
    setDeleteModalVisible(true);
  };

  const displayError = (message) => {
    setErrorMessage(message);
    setShowError(true);
    
    // Auto-hide error after 3 seconds
    setTimeout(() => {
      setShowError(false);
      setErrorMessage("");
    }, 3000);
  };

  const confirmDeleteSeal = async () => {
    if (!selectedItem) return;
    
    const itemToDelete = selectedItem;
    console.log("Confirmed delete for:", itemToDelete.id);

    setDeleteModalVisible(false);
    setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));

    try {
      const res = await fetch(`${BASE_URL}/seals/${itemToDelete.id}/`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Delete failed:", errorText);
        throw new Error("Delete failed");
      }

      console.log("✅ Deleted successfully");
    } catch (err) {
      console.error("❌ Delete error:", err);
      fetchItems();
      Alert.alert("Error", "Could not delete seal. The item will be restored.");
    } finally {
      setSelectedItem(null);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch(`${BASE_URL}/seals/`);
      if (!res.ok) throw new Error("Could not fetch items");
      
      const json = await res.json();

      const itemsWithNumbers = json.map(item => ({
        ...item,
        stock: Number(item.stock),
        minStock: Number(item.minStock) || 5
      }));

      setItems(itemsWithNumbers);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleUpdateStock = async (type) => {
    if (!selectedItem || !quantity) return;

    const qtyChange = parseInt(quantity);

    // --- ENHANCED VALIDATIONS ---
    // Check if input is a valid number
    if (isNaN(qtyChange)) {
      displayError("❌ Invalid Input: Please enter a valid number.");
      setSellModalVisible(false);
      setRestockModalVisible(false);
      setQuantity("1");
      return;
    }

    // Check for negative values
    if (qtyChange < 0) {
      displayError("❌ Invalid Input: Quantity cannot be negative.");
      setSellModalVisible(false);
      setRestockModalVisible(false);
      setQuantity("1");
      return;
    }

    // Check for zero or negative after conversion
    if (qtyChange <= 0) {
      displayError("❌ Invalid Input: Please enter a number greater than 0.");
      setSellModalVisible(false);
      setRestockModalVisible(false);
      setQuantity("1");
      return;
    }

    // For selling: cannot sell more than current stock
    if (type === "sell" && qtyChange > selectedItem.stock) {
      displayError(
        `❌ Not Enough Stock: Cannot sell ${qtyChange} units. Only ${selectedItem.stock} available.`
      );
      setSellModalVisible(false);
      setQuantity("1");
      return;
    }

    const newStock = type === "sell"
      ? selectedItem.stock - qtyChange
      : selectedItem.stock + qtyChange;

    // Additional check: ensure new stock doesn't go negative
    if (newStock < 0) {
      displayError("❌ Invalid Operation: Stock cannot be negative.");
      setSellModalVisible(false);
      setRestockModalVisible(false);
      setQuantity("1");
      return;
    }

    try {
      const invRes = await fetch(`${BASE_URL}/seals/${selectedItem.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });

      if (!invRes.ok) throw new Error("Inventory update failed");

      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === selectedItem.id ? { ...item, stock: newStock } : item
        )
      );

      if (type === "sell") {
        const salePayload = {
          partCode: selectedItem.partCode,  // Backend expects 'seal_partCode'
          quantity: qtyChange,
          sold_price: parseFloat(selectedItem.price),
        };

        const saleRes = await fetch(`${BASE_URL}/sales/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(salePayload),
        });

        if (!saleRes.ok) {
          displayError("⚠️ Partial Success: Stock updated, but sale record failed.");
        } else {
          displayError(`✅ Success: Sold ${qtyChange} units`);
        }
      } else {
        displayError(`✅ Success: Stock updated to ${newStock}`);
      }

      setSellModalVisible(false);
      setRestockModalVisible(false);
      setQuantity("1");
    } catch (err) {
      console.error(err);
      displayError("❌ Error: Network or server error.");
      setSellModalVisible(false);
      setRestockModalVisible(false);
      setQuantity("1");
    }
  };

  const handleAddNewItem = async () => {
    const payload = {
      ...newItem,
      price: parseFloat(newItem.price) || 0,
      stock: parseInt(newItem.stock) || 0,
      minStock: parseInt(newItem.minStock) || 5
    };

    try {
      const response = await fetch(`${BASE_URL}/seals/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        fetchItems();
        setAddModalVisible(false);
        setNewItem({
          nameOfSeal: "", partCode: "", description: "",
          price: "", stock: "", minStock: "5"
        });
        Alert.alert("Success", "Seal added to inventory");
      } else {
        Alert.alert("Error", "Check fields and try again.");
      }
    } catch (error) {
      Alert.alert("Connection Error", "Is the backend running?");
    }
  };

  const renderHeader = () => (
    <View style={styles.headerRow}>
      <Text style={styles.columnHeader}>CODE</Text>
      <Text style={styles.columnHeader}>PRICE</Text>
      <Text style={styles.columnHeader}>STOCK</Text>
      {!isSmallScreen && (
        <Text style={[styles.columnHeader, { flex: 1.2 }]}>ACTIONS</Text>
      )}
    </View>
  );

  const openRestockModal = (item) => {
    setSelectedItem(item);
    setQuantity("1");
    setRestockModalVisible(true);
  };

  const openSellModal = (item) => {
    setSelectedItem(item);
    setQuantity("1");
    setSellModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen
        options={{
          title: "Inventory",
          headerStyle: { backgroundColor: "#0F172A" },
          headerTintColor: "#fff"
        }}
      />

      {/* --- ERROR BANNER --- */}
      {showError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <Modal visible={deleteModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⚠️ Delete Seal</Text>
            <Text style={{ color: "#94A3B8", marginBottom: 20, textAlign: "center" }}>
              Are you sure you want to delete{"\n"}
              <Text style={{ color: "#F8FAFC", fontWeight: "bold" }}>
                "{selectedItem?.partCode}"
              </Text>
              ?{"\n"}
              This action cannot be undone.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#334155" }]}
                onPress={() => {
                  setDeleteModalVisible(false);
                  setSelectedItem(null);
                }}
              >
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#EF4444" }]}
                onPress={confirmDeleteSeal}
              >
                <Text style={styles.btnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- ADD NEW SEAL MODAL --- */}
      <Modal visible={addModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Entry</Text>

            <ScrollView style={{ width: "100%" }}>
              <Text style={styles.inputLabel}>Part Code</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. 100234"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={newItem.partCode}
                onChangeText={(t) => setNewItem({ ...newItem, partCode: t })}
              />

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.formInput, { height: 60 }]}
                placeholder="Enter a description for the seal"
                placeholderTextColor="#94A3B8"
                multiline
                value={newItem.description}
                onChangeText={(t) => setNewItem({ ...newItem, description: t })}
              />

              <Text style={styles.inputLabel}>Price</Text>
              <TextInput
                style={styles.formInput}
                placeholder="0.00"
                placeholderTextColor="#94A3B8"
                value={newItem.price}
                onChangeText={(t) => setNewItem({ ...newItem, price: t })}
              />

              <Text style={styles.inputLabel}>Initial Stock</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Current quantity"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={newItem.stock}
                onChangeText={(t) => setNewItem({ ...newItem, stock: t })}
              />

              <Text style={[styles.inputLabel, { color: "#38BDF8" }]}>
                Minimum Stock Alert Level
              </Text>
              <TextInput
                style={[styles.formInput, { borderColor: "#38BDF8" }]}
                placeholder="Alert me when stock is below..."
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={newItem.minStock}
                onChangeText={(t) => setNewItem({ ...newItem, minStock: t })}
              />
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#334155" }]}
                onPress={() => setAddModalVisible(false)}
              >
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#10B981" }]}
                onPress={handleAddNewItem}
              >
                <Text style={styles.btnText}>Save to Inventory</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- RESTOCK MODAL --- */}
      <Modal visible={restockModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Restock Seal</Text>
            
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ color: "#38BDF8", fontSize: 18, fontWeight: "bold" }}>
                Code: {selectedItem?.partCode}
              </Text>
              <Text style={{ color: "#94A3B8", fontSize: 14, marginTop: 4 }}>
                Current Volume: <Text style={{ color: "#10B981", fontWeight: "bold" }}>{selectedItem?.stock}</Text>
              </Text>
            </View>

            <TextInput
              style={styles.formInput}
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
              placeholder="Enter amount to add"
              placeholderTextColor="#94A3B8"
              autoFocus={true}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#334155" }]}
                onPress={() => {
                  setRestockModalVisible(false);
                  setQuantity("1");
                }}
              >
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#10B981" }]}
                onPress={() => handleUpdateStock("add")}
              >
                <Text style={styles.btnText}>Confirm Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- SELL MODAL --- */}
      <Modal visible={sellModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sell Seal</Text>
            
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ color: "#F59E0B", fontSize: 18, fontWeight: "bold" }}>
                Code: {selectedItem?.partCode}
              </Text>
              <Text style={{ color: "#94A3B8", fontSize: 14, marginTop: 4 }}>
                Available Stock: <Text style={{ color: "#10B981", fontWeight: "bold" }}>{selectedItem?.stock}</Text>
              </Text>
            </View>

            <TextInput
              style={styles.formInput}
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
              placeholder="Enter quantity to sell"
              placeholderTextColor="#94A3B8"
              autoFocus={true}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#334155" }]}
                onPress={() => {
                  setSellModalVisible(false);
                  setQuantity("1");
                }}
              >
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#F59E0B" }]}
                onPress={() => handleUpdateStock("sell")}
              >
                <Text style={styles.btnText}>Confirm Sell</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.topRow}>
        <Text style={styles.mainTitle}>Seal Inventory</Text>
        <TouchableOpacity
          style={styles.addItemBtn}
          onPress={() => setAddModalVisible(true)}
        >
          <Text style={styles.btnText}>+ New Seal</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#38BDF8" />
      ) : (
        <FlatList
          data={items}
          ListHeaderComponent={renderHeader}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemCard}>
              <View style={styles.dataRow}>
                {/* Part Code - aligned with CODE header */}
                <Text style={[styles.cell, { fontWeight: "bold", color: "#F8FAFC" }]}>
                  {item.partCode}
                </Text>

                {/* Price - aligned with PRICE header */}
                <Text style={styles.cell}>Rs {item.price}</Text>

                {/* Stock - aligned with STOCK header */}
                <Text
                  style={[
                    styles.cell,
                    { fontWeight: "bold", color: item.stock <= item.minStock ? "#EF4444" : "#10B981" }
                  ]}
                >
                  {item.stock}
                </Text>

                {/* Actions - aligned with ACTIONS header */}
                {!isSmallScreen && (
                  <View style={[styles.actionCell, { flex: 1.2 }]}>
                    <TouchableOpacity
                      style={styles.sellBtn}
                      onPress={() => openSellModal(item)}
                    >
                      <Text style={styles.btnText}>Sell</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.addBtn}
                      onPress={() => openRestockModal(item)}
                    >
                      <Text style={styles.btnText}>+ Add</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDeleteSeal(item)}
                    >
                      <Text style={styles.btnText}>🗑</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Show actions below on small screens */}
              {isSmallScreen && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.sellBtn, { flex: 1 }]}
                    onPress={() => openSellModal(item)}
                  >
                    <Text style={styles.btnText}>Sell</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.addBtn, { flex: 1 }]}
                    onPress={() => openRestockModal(item)}
                  >
                    <Text style={styles.btnText}>+ Add</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.deleteBtn, { flex: 1 }]}
                    onPress={() => handleDeleteSeal(item)}
                  >
                    <Text style={styles.btnText}>🗑</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A", padding: 16 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },
  mainTitle: { fontSize: 26, fontWeight: "bold", color: "#F8FAFC" },
  addItemBtn: { backgroundColor: "#10B981", padding: 10, borderRadius: 10 },
  inputLabel: {
    color: "#94A3B8",
    fontSize: 12,
    marginBottom: 5,
    fontWeight: "600",
    marginLeft: 4
  },
  headerRow: {
    flexDirection: "row",
    paddingBottom: 10,
    marginBottom: 15,
    gap: 4
  },
  columnHeader: { 
    flex: 1, 
    color: "#F8FAFC", 
    fontWeight: "bold", 
    fontSize: 13, 
    textAlign: "center",
    backgroundColor: "#334155",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    overflow: "hidden",
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  itemCard: {
    backgroundColor: "#1E293B",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#334155"
  },
  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#334155"
  },
  cell: { 
    flex: 1, 
    textAlign: "center", 
    color: "#CBD5E1", 
    fontSize: 14 
  },
  actionCell: { 
    flexDirection: "row", 
    gap: 6, 
    flex: 1.2,
    justifyContent: "center",
    alignItems: "center"
  },
  sellBtn: { 
    backgroundColor: "#F59E0B", 
    paddingVertical: 6, 
    paddingHorizontal: 10, 
    borderRadius: 6 
  },
  addBtn: { 
    backgroundColor: "#38BDF8", 
    paddingVertical: 6, 
    paddingHorizontal: 10, 
    borderRadius: 6 
  },
  deleteBtn: { 
    backgroundColor: "#EF4444", 
    paddingVertical: 6, 
    paddingHorizontal: 10, 
    borderRadius: 6 
  },
  btnText: { 
    color: "white", 
    fontSize: 12, 
    fontWeight: "bold", 
    textAlign: "center" 
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center"
  },
  modalContent: {
    backgroundColor: "#1E293B",
    padding: 25,
    borderRadius: 20,
    width: "85%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155"
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: "bold", 
    color: "#F8FAFC", 
    marginBottom: 10 
  },
  formInput: {
    backgroundColor: "#0F172A",
    color: "#FFF",
    width: "100%",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#334155"
  },
  modalButtons: { flexDirection: "row", gap: 10 },
  modalBtn: { padding: 12, borderRadius: 10, flex: 1, alignItems: "center" },
  errorBanner: {
    position: "absolute",
    top: 80,
    left: 16,
    right: 16,
    backgroundColor: "#1E293B",
    borderWidth: 2,
    borderColor: "#F59E0B",
    borderRadius: 12,
    padding: 16,
    zIndex: 1000,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  errorText: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 20,
  }
});