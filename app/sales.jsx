import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  StatusBar,
  TouchableOpacity,
  Alert,
  Modal
} from "react-native";
import { Stack } from "expo-router";

const BASE_URL = "https://usingrender-x7yq.onrender.com";

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const res = await fetch(`${BASE_URL}/sales/`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      
      console.log("Fetched sales:", json.length);
      // Log first item to see structure
      if (json.length > 0) {
        console.log("First sale item:", json[0]);
      }
      
      // Sort by date, newest first
      const sortedSales = json.sort((a, b) => 
        new Date(b.date_sold) - new Date(a.date_sold)
      );
      
      setSales(sortedSales);
      setLoading(false);
    } catch (err) {
      console.error("Fetch Error:", err);
      setLoading(false);
    }
  };

  const clearAllLogs = async () => {
    console.log("🔴 clearAllLogs called");
    console.log("Sales to delete:", sales.length);
    
    setConfirmModalVisible(false);
    setClearing(true);
    
    // Optimistically update UI
    const salesToDelete = [...sales];
    setSales([]);
    
    try {
      console.log("Starting deletion process...");
      
      // Delete each sale record with trailing slash
      const deletePromises = salesToDelete.map((sale, index) => {
        console.log(`Deleting sale ${index + 1}/${salesToDelete.length}: ID ${sale.id}`);
        return fetch(`${BASE_URL}/sales/${sale.id}/`, { 
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });
      });
      
      const results = await Promise.all(deletePromises);
      
      console.log("Delete results:", results.map(r => ({ ok: r.ok, status: r.status })));
      
      // Check if all deletions succeeded
      const allSucceeded = results.every(res => res.ok);
      
      if (allSucceeded) {
        console.log("✅ All deletions succeeded");
        alert("Success: All sales logs have been cleared.");
      } else {
        console.log("❌ Some deletions failed");
        // Some failed, restore data and show error
        setSales(salesToDelete);
        alert("Error: Some records could not be deleted. Please try again.");
        console.error("Some deletions failed:", results.map(r => r.status));
      }
    } catch (err) {
      console.error("❌ Clear Error:", err);
      // Restore data on error
      setSales(salesToDelete);
      alert("Error: Failed to clear logs. Please try again.");
    } finally {
      console.log("Clearing finished");
      setClearing(false);
    }
  };

  const handleClearLogs = () => {
    console.log("🟡 handleClearLogs called");
    console.log("Current sales count:", sales.length);
    setConfirmModalVisible(true);
  };

  const renderItem = ({ item }) => {
    // Try different possible field names for the part code
    const partCode = item.seal_partCode || item.partCode || item.seal?.partCode;
    
    return (
      <View style={styles.itemCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.sealName}>Code: {partCode}</Text>
          <Text style={styles.dateText}>
            {new Date(item.date_sold).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={styles.detailsRow}>
          <View>
            <Text style={styles.label}>QUANTITY</Text>
            <Text style={styles.value}>{item.quantity}</Text>
          </View>
          <View>
            <Text style={styles.label}>UNIT PRICE</Text>
            <Text style={styles.value}>Rs {parseFloat(item.sold_price).toFixed(2)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.label}>TOTAL REVENUE</Text>
            <Text style={[styles.value, { color: '#10B981' }]}>
              Rs {(parseFloat(item.sold_price) * item.quantity).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen 
        options={{ 
          title: "Sales History",
          headerStyle: { backgroundColor: "#0F172A" },
          headerTintColor: "#fff"
        }} 
      />

      {/* Confirmation Modal */}
      <Modal visible={confirmModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⚠️ Clear All Logs</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete all {sales.length} sales records?{"\n\n"}
              <Text style={{ color: "#EF4444", fontWeight: "bold" }}>
                This action cannot be undone.
              </Text>
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#334155" }]}
                onPress={() => {
                  console.log("User cancelled");
                  setConfirmModalVisible(false);
                }}
              >
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#EF4444" }]}
                onPress={() => {
                  console.log("User confirmed deletion");
                  clearAllLogs();
                }}
              >
                <Text style={styles.btnText}>Delete All</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      <View style={styles.header}>
        <Text style={styles.mainTitle}>Transaction Log</Text>
        {sales.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => {
              console.log("🔵 Button pressed!");
              handleClearLogs();
            }}
            disabled={clearing}
            activeOpacity={0.7}
          >
            {clearing ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.clearButtonText}>Clear Logs</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#38BDF8" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={sales}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No sales recorded yet.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#0F172A", 
    paddingHorizontal: 16 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20
  },
  mainTitle: { 
    fontSize: 26, 
    fontWeight: "bold", 
    color: "#F8FAFC"
  },
  clearButton: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center'
  },
  clearButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14
  },
  itemCard: {
    backgroundColor: "#1E293B",
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingBottom: 10,
    marginBottom: 12
  },
  sealName: { 
    fontWeight: "bold", 
    color: "#F8FAFC", 
    fontSize: 18 
  },
  dateText: {
    color: "#64748B",
    fontSize: 12
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  label: {
    color: "#94A3B8",
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4
  },
  value: {
    color: "#CBD5E1",
    fontSize: 16,
    fontWeight: '600'
  },
  emptyText: {
    color: "#64748B",
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16
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
    maxWidth: 400,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155"
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: "bold", 
    color: "#F8FAFC", 
    marginBottom: 15 
  },
  modalMessage: {
    color: "#94A3B8",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20
  },
  modalButtons: { 
    flexDirection: "row", 
    gap: 10,
    width: "100%"
  },
  modalBtn: { 
    padding: 12, 
    borderRadius: 10, 
    flex: 1, 
    alignItems: "center" 
  },
  btnText: { 
    color: "white", 
    fontSize: 14, 
    fontWeight: "bold" 
  }
});