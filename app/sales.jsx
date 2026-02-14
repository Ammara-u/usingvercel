import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  StatusBar 
} from "react-native";
import { Stack } from "expo-router";

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSales();
  }, []);

const fetchSales = async () => {
  try {
    const res = await fetch("https://usingrender-x7yq.onrender.com/");
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const json = await res.json();
    setSales(json);
    setLoading(false);
  } catch (err) {
    console.error("Fetch Error:", err);
    setLoading(false);
  }
};


  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.sealName}>{item.seal_name || "Unknown Seal"}</Text>
        <Text style={styles.dateText}>
          {new Date(item.date_sold).toLocaleDateString()}
        </Text>
      </View>
      
      <View style={styles.detailsRow}>
        <View>
          <Text style={styles.label}>QUANTITY</Text>
          <Text style={styles.value}>{item.quantity}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.label}>TOTAL REVENUE</Text>
          <Text style={[styles.value, { color: '#10B981' }]}>
            {parseFloat(item.total_price).toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );

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
      
      <Text style={styles.mainTitle}>Transaction Log</Text>

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
  mainTitle: { 
    fontSize: 26, 
    fontWeight: "bold", 
    color: "#F8FAFC", 
    marginVertical: 20 
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
  }
});