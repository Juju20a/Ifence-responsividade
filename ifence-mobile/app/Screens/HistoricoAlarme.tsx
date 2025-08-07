import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useDaltonicColors } from "../hooks/useDaltonicColors";

type AlarmeHistorico = {
  nomeCerca: string;
  timestamp: string;
};

const { width } = Dimensions.get("window");

const Historico = () => {
  const colors = useDaltonicColors();
  const [historico, setHistorico] = useState<AlarmeHistorico[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistorico = async () => {
    try {
      const historicoSalvo = await AsyncStorage.getItem("historico_alarmes");
      const historicoArray = historicoSalvo ? JSON.parse(historicoSalvo) : [];
      const historicoUnico = (historicoArray as AlarmeHistorico[]).reduce(
        (acc: AlarmeHistorico[], curr: AlarmeHistorico) => {
          if (!acc.find((item) => item.nomeCerca === curr.nomeCerca)) {
            acc.push(curr);
          }
          return acc;
        },
        []
      );
      setHistorico(historicoUnico);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao obter histórico:", error);
      setLoading(false);
    }
  };

  const limparHistorico = async () => {
    try {
      await AsyncStorage.removeItem("historico_alarmes");
      setHistorico([]);
    } catch (error) {
      console.error("Erro ao limpar histórico:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHistorico();
    }, [])
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.title} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.textHeader, { color: colors.title }]}>Histórico de Alarmes</Text>

      <TouchableOpacity
        style={[styles.deleteButton, { backgroundColor: colors.button }]}
        onPress={limparHistorico}
      >
        <Text style={[styles.deleteButtonText, { color: colors.buttonText }]}>Deletar</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.history}>
          {historico.length === 0 ? (
            <Text style={[styles.noHistory, { color: colors.infoText }]}>
              Nenhum alarme registrado ainda.
            </Text>
          ) : (
            historico.map((alarme, index) => (
              <View key={index} style={[styles.historyItem, { backgroundColor: colors.infoBox }]}>
                <Text style={[styles.textmap, { color: colors.infoText }]}>
                  Alarme: {alarme.nomeCerca}
                  {"\n"}Data: {alarme.timestamp}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  textHeader: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
  textmap: {
    fontSize: 16,
  },
  history: {
    marginTop: 10,
  },
  historyItem: {
    padding: 15,
    marginVertical: 8,
    borderRadius: 12,
  },
  noHistory: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 30,
  },
  deleteButton: {
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 15,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Historico;
