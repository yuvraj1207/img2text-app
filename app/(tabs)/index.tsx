
import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";

const BACKEND_URL = "https://img2text-backend.onrender.com";

export default function HomeScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================
  // COMPRESS IMAGE
  // =========================
  const compressImage = async (uri: string): Promise<string> => {
    const compressed = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1000 } }],
      {
        compress: 0.6,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );
    return compressed.uri;
  };

  // =========================
  // PICK FROM GALLERY
  // =========================
  const pickFromGallery = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Please allow gallery access");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setText("");
    }
  };

  // =========================
  // TAKE PHOTO
  // =========================
  const takePhoto = async () => {
    const permissionResult =
      await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Please allow camera access");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setText("");
    }
  };

  // =========================
  // OCR + BACKEND FLOW
  // =========================
  const handleScan = async () => {
    if (!image) {
      Alert.alert("No Image", "Please select or capture an image first");
      return;
    }

    try {
      setLoading(true);
      console.log("STEP 1: OCR START");

      const apiKey = process.env.EXPO_PUBLIC_OCR_API_KEY;
      if (!apiKey) {
        Alert.alert("Missing API Key", "OCR key not found in EAS or .env");
        return;
      }

      // =========================
      // COMPRESS BEFORE OCR
      // =========================
      console.log("STEP 2: Compressing image");
      const compressedUri = await compressImage(image);
      console.log("Compressed URI:", compressedUri);

      // =========================
      // CONVERT TO BASE64
      // =========================
      console.log("STEP 3: Converting to base64");

      let base64: string;

      if (
        compressedUri.startsWith("file://") ||
        compressedUri.startsWith("/")
      ) {
        // Use expo-file-system to read file as base64
        base64 = await FileSystem.readAsStringAsync(compressedUri, {
          encoding: "base64",
        });
      } else {
        const response = await fetch(compressedUri);
        const blob = await response.blob();
        base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result.split(",")[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }

      console.log("STEP 4: Sending OCR request");

      const formData = new FormData();
      formData.append("apikey", apiKey);
      formData.append("language", "eng");
      formData.append("isOverlayRequired", "false");
      formData.append("base64Image", `data:image/jpeg;base64,${base64}`);

      const ocrRes = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        body: formData,
      });

      const data = await ocrRes.json();
      console.log("OCR RESPONSE:", data);

      const extracted =
        data?.ParsedResults?.[0]?.ParsedText?.trim() || "";

      if (!extracted) {
        Alert.alert(
          "No Text Found",
          "OCR could not detect text in this image"
        );
        return;
      }

      setText(extracted);

      console.log("STEP 5: Saving to backend");

      await axios.post(`${BACKEND_URL}/save-text`, {
        image_name: `scan_${Date.now()}`,
        extracted_text: extracted,
      });

      Alert.alert("Success", "Scan completed and saved to history");
    } catch (err: any) {
      console.log("ERROR:", err);
      console.log("ERROR MESSAGE:", err?.message);
      Alert.alert(
        "Scan Failed",
        err?.message || "Unknown error — check logs"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* HEADER */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>TextLens Scanner</Text>
        <Text style={styles.subHeader}>
          Capture or upload a document to extract text instantly
        </Text>
      </View>

      {/* ACTION CARDS */}
      <View style={styles.cardRow}>

        <TouchableOpacity
          style={styles.card}
          onPress={pickFromGallery}
          activeOpacity={0.8}
        >
          <Text style={styles.cardIcon}>📁</Text>
          <Text style={styles.cardTitle}>Gallery</Text>
          <Text style={styles.cardText}>Pick from photos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={takePhoto}
          activeOpacity={0.8}
        >
          <Text style={styles.cardIcon}>📷</Text>
          <Text style={styles.cardTitle}>Camera</Text>
          <Text style={styles.cardText}>Capture new scan</Text>
        </TouchableOpacity>

      </View>

      {/* IMAGE PREVIEW */}
      {image && (
        <View style={styles.previewBox}>
          <Text style={styles.sectionTitle}>Preview</Text>
          <Image source={{ uri: image }} style={styles.image} />
        </View>
      )}

      {/* SCAN BUTTON */}
      {image && (
        <TouchableOpacity
          style={styles.scanButton}
          onPress={handleScan}
          activeOpacity={0.8}
        >
          <Text style={styles.scanText}>Scan Text</Text>
        </TouchableOpacity>
      )}

      {/* LOADING */}
      {loading && (
        <ActivityIndicator
          size="large"
          color="#CE2626"
          style={{ marginTop: 25 }}
        />
      )}

      {/* RESULT */}
      {text ? (
        <View style={styles.resultBox}>
          <View style={styles.resultHeader}>
            <Text style={styles.sectionTitle}>Extracted Text</Text>
          </View>
          <Text style={styles.resultText}>{text}</Text>
        </View>
      ) : null}

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
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: "#E8DBB3",
    padding: 18,
    borderRadius: 20,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  cardIcon: {
    fontSize: 24,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2C3E50",
  },
  cardText: {
    fontSize: 13,
    marginTop: 4,
    color: "#4A5568",
  },
  previewBox: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#7DAACB",
    marginBottom: 12,
  },
  image: {
    width: "100%",
    height: 300,
    borderRadius: 20,
    backgroundColor: "#E8DBB3",
  },
  scanButton: {
    marginTop: 25,
    backgroundColor: "#CE2626",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#CE2626",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  scanText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  resultBox: {
    marginTop: 30,
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 20,
    marginBottom: 40,
    borderLeftWidth: 6,
    borderLeftColor: "#7DAACB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  resultHeader: {
    marginBottom: 5,
  },
  resultText: {
    fontSize: 15,
    color: "#333333",
    lineHeight: 24,
  },
});
