import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import axios from "axios";

type Item = {
  id: number;
  image_name: string;
  extracted_text: string;
  created_at: string;
};

// ⚠️ REMEMBER TO REPLACE THIS WITH YOUR ACTUAL RENDER BACKEND URL
const BACKEND_URL = "https://img2text-backend.onrender.com";

export default function HistoryScreen() {
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

 
  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/texts`);
      
      // Look for the array inside res.data.data
      if (res.data && Array.isArray(res.data.data)) {
        setData(res.data.data);
      } else {
        console.log("Backend did not return an array:", res.data);
        setData([]);
      }
    } catch (err) {
      console.log("Error loading database history:", err);
      setData([]); 
    } finally {
      setLoading(false);
    }
  };
  //   try {
  //     setLoading(true);
  //     const res = await axios.get(`${BACKEND_URL}/texts`);
      
  //     // Look at what the server returned and make sure it turns into a clean array
  //     if (Array.isArray(res.data)) {
  //       setData(res.data);
  //     } else if (res.data && Array.isArray(res.data.texts)) {
  //       // Fallback case: If your server returns an object like { texts: [...] }
  //       setData(res.data.texts);
  //     } else {
  //       // If the server returns something weird, default to an empty list instead of crashing
  //       console.log("Backend did not return an array:", res.data);
  //       setData([]);
  //     }
  //   } catch (err) {
  //     console.log("Error loading database history:", err);
  //     setData([]); // Set empty array on failure so map doesn't crash
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Scan History</Text>
        <Text style={styles.subHeader}>
          All your scanned documents are saved here
        </Text>
      </View>

      {/* LOADING */}
      {loading ? (
        <ActivityIndicator size="large" color="#CE2626" style={{ marginTop: 40 }} />
      ) : !data || data.length === 0 ? (
        
        /* EMPTY STATE */
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>📂</Text>
          <Text style={styles.emptyText}>
            No scans found yet
          </Text>
          <Text style={styles.emptySub}>
            Start scanning images from the Home tab
          </Text>
        </View>

      ) : (
        
        /* CARDS */
        data.map((item) => (
          <View key={item.id || Math.random().toString()} style={styles.card}>
            
            <Text style={styles.name}>
              {item.image_name || "Unnamed Scan"}
            </Text>

            <Text style={styles.text} numberOfLines={4}>
              {item.extracted_text || "No text extracted"}
            </Text>

            <View style={styles.footerRow}>
              <Text style={styles.date}>
                {item.created_at ? new Date(item.created_at).toLocaleString() : "Unknown date"}
              </Text>
            </View>

          </View>
        ))
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#FFFDEB", 
    flexGrow: 1,
  },
  headerContainer: {
    marginBottom: 30,
    alignItems: "center",
  },
  header: {
    fontSize: 32,
    fontWeight: "800",
    color: "#141414", 
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subHeader: {
    fontSize: 15,
    color: "#555", 
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: "#FFFFFF", 
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    borderLeftWidth: 6,
    borderLeftColor: "#141414",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  name: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2C3E50", 
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: "#333333", 
    lineHeight: 22,
  },
  footerRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  date: {
    fontSize: 12,
    fontWeight: "600",
    color: "#CE2626", 
  },
  emptyBox: {
    marginTop: 80,
    alignItems: "center",
    backgroundColor: "#E8DBB3", 
    padding: 30,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2C3E50",
  },
  emptySub: {
    fontSize: 14,
    color: "#4A5568",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
});