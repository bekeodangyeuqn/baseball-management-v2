import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useState } from "react";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import { useToast } from "react-native-toast-notifications";
import axiosInstance from "../lib/axiosClient";
import * as DocumentPicker from "expo-document-picker";
import { color } from "react-native-reanimated";

const ImportExcelPlayerScreen = () => {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const [pickedDocument, setPickedDocument] = useState(null);
  const toast = useToast();
  const route = useRoute();
  const teamid = route.params.teamid;

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // Filter for Excel files (XLSX)
      });
      console.log(result);

      if (result.type === "success") {
        console.log("Excel file URI:", result.uri);
        setPickedDocument(result);
        // Handle the selected file (more on this later)
      } else {
        console.log("User canceled file picker");
      }
    } catch (error) {
      toast.show(error.message, {
        type: "danger",
        placement: "bottom",
        duration: 4000,
        offset: 30,
        animationType: "zoom-in",
      });
    }
  };
  console.log(pickedDocument);
  const handleImportExcelPlayer = async () => {
    try {
      setIsLoading(true);
      if (pickedDocument) {
        const formData = new FormData();
        formData.append("file", {
          uri: pickedDocument.uri,
          type: pickedDocument.mimeType,
          name: pickedDocument.name.split(".")[0],
          size: pickedDocument.size,
        });
        const response = await axiosInstance.post("/player/import/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setIsLoading(false);
        toast.show("Import thành công", {
          type: "success",
          placement: "bottom",
          duration: 4000,
          offset: 30,
          animationType: "zoom-in",
        });
        navigation.navigate("PlayerList", {
          teamid: teamid,
        });
        return response;
      } else {
        toast.show("Vui lòng chọn lại file", {
          type: "warning",
          placement: "bottom",
          duration: 4000,
          offset: 30,
          animationType: "zoom-in",
        });
        return;
      }
    } catch (error) {
      //Toast.show(error.message);
      setIsLoading(false);
      toast.show(error.message, {
        type: "danger",
        placement: "bottom",
        duration: 4000,
        offset: 30,
        animationType: "zoom-in",
      });
    }
  };
  return (
    <Formik
      initialValues={{
        file: pickedDocument,
      }}
      onSubmit={() => {
        handleImportExcelPlayer();
      }}
    >
      {(formik) => {
        return (
          <View style={styles.container}>
            <Text style={styles.title}>Import các cầu thủ từ file excel</Text>
            <TouchableOpacity style={styles.button} onPress={pickDocument}>
              <Text style={{ color: "white" }}>Chọn một file excel</Text>
            </TouchableOpacity>

            {pickedDocument && (
              <View>
                <Text>File đã chọn:</Text>
                <Text>Tên file: {pickedDocument.name}</Text>
                <Text>
                  Kích thước: {(pickedDocument.size / (1024 * 1024)).toFixed(2)}{" "}
                  MB
                </Text>
              </View>
            )}
            {formik.errors.file && (
              <Text style={{ color: "red" }}>{formik.errors.file}</Text>
            )}
            <Button title="Import" onPress={formik.handleSubmit} />
            {error && <Text style={{ color: "red" }}>{error}</Text>}
            {isLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#0000ff" />
              </View>
            )}
          </View>
        );
      }}
    </Formik>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  input: {
    width: 300,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  button: {
    marginBottom: 5,
    borderStyle: "solid",
    borderColor: "black",
    backgroundColor: "green",
    padding: 10,
    marginRight: 4,
  },
  textButton: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: "bold",
  },
  error: {
    color: "#f00",
  },
  social: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ImportExcelPlayerScreen;
