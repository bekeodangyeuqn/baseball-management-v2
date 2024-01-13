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
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import { useToast } from "react-native-toast-notifications";
import axiosInstance from "../lib/axiosClient";
import DocumentPicker from "react-native-document-picker";

const ImportExcelPlayerScreen = () => {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const [pickedDocument, setPickedDocument] = useState(null);
  const toast = useToast();

  const pickDocument = async () => {
    try {
      const result = await new DocumentPicker.pick({
        type: [DocumentPicker.types.xls, DocumentPicker.types.xlsx],
      });

      console.log(
        result[0].uri,
        result[0].type, // mime type
        result[0].name,
        result[0].size
      );
      setPickedDocument(result[0]);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        toast.show(
          "Định dạng file không đúng (chỉ chấp nhận .xls hoặc .xlsx)",
          {
            type: "warning",
            placement: "bottom",
            duration: 4000,
            offset: 30,
            animationType: "zoom-in",
          }
        );
      } else {
        throw err;
      }
    }
  };

  const handleImportExcelPlayer = async () => {
    try {
      setIsLoading(true);
      if (pickedDocument) {
        const formData = new FormData();
        formData.append("file", {
          uri: pickedDocument.uri,
          type: pickedDocument.type,
          name: pickedDocument.name,
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
        navigation.navigate("CreateJoinTeam");
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
              <Text>Pick a File</Text>
            </TouchableOpacity>

            {pickedDocument && (
              <View>
                <Text>Selected File:</Text>
                <Text>{pickedDocument.name}</Text>
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
    padding: 4,
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
