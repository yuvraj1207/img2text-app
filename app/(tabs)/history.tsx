import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import axios from "axios";

type Item = {
  id: number;
  image_name: string;
  extracted_text: string;
  created_at: string;
};

const BACKEND_URL = "https://img2text-backend.onrender.com";

export default function HistoryScreen() {
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State to handle which item is currently being viewed in full
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/texts`);
      
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

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <View style={{ flex: 1 }}>
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
            <TouchableOpacity 
              key={item.id || Math.random().toString()} 
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => setSelectedItem(item)} // Open the modal with this item
            >
              
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

            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* DETAIL VIEW MODAL */}
      <Modal
        visible={!!selectedItem}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedItem(null)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedItem?.image_name || "Scan Details"}
              </Text>
              <Pressable 
                onPress={() => setSelectedItem(null)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>

            {/* Modal Content */}
            <ScrollView style={styles.modalContent}>
              <Text style={styles.fullText}>
                {selectedItem?.extracted_text || "No text available."}
              </Text>
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <Text style={styles.modalDate}>
                Scanned on: {selectedItem?.created_at ? new Date(selectedItem.created_at).toLocaleString() : "Unknown date"}
              </Text>
            </View>

          </View>
        </View>
      </Modal>
    </View>
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

  /* MODAL STYLES */
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end", // Opens from the bottom
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: "80%", // Takes up 80% of the screen
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingBottom: 15,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#141414",
    flex: 1,
  },
  closeButton: {
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
  },
  modalContent: {
    flex: 1,
  },
  fullText: {
    fontSize: 16,
    color: "#333333",
    lineHeight: 26,
  },
  modalFooter: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    alignItems: "center",
  },
  modalDate: {
    fontSize: 13,
    fontWeight: "600",
    color: "#888",
  },
});