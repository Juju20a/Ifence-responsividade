import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useDaltonicColors } from "../hooks/useDaltonicColors";

export const options = {
  headerShown: false,
};

type Localizacao = {
  latitude: number;
  longitude: number;
  timestamp: string;
};

const { width } = Dimensions.get("window");

const ListarLocalizacoesPulseira = () => {
  const colors = useDaltonicColors();
  const [localizacoes, setLocalizacoes] = useState<Localizacao[]>([]);
  const { pulseiraId, cercaId } = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    const carregarLocalizacoes = async () => {
      const chave = `localizacoes_${cercaId}`;
      const localizacoesSalvas = await AsyncStorage.getItem(chave);
      if (localizacoesSalvas) {
        setLocalizacoes(JSON.parse(localizacoesSalvas) as Localizacao[]);
      }
    };
    carregarLocalizacoes();
  }, [pulseiraId, cercaId]);

  const abrirMapaComLocalizacao = (localizacao: Localizacao) => {
    router.push({
      pathname: "/Screens/ListarRotasPulseiras",
      params: {
        latitude: localizacao.latitude,
        longitude: localizacao.longitude,
        timestamp: localizacao.timestamp,
        cercaId,
      },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.titulo, { color: colors.title }]}>
        Histórico de Localizações da Pulseira
      </Text>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {localizacoes.map((loc, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.localizacaoItem,
              {
                backgroundColor: colors.button,
                borderBottomColor: colors.border,
              },
            ]}
            onPress={() => abrirMapaComLocalizacao(loc)}
          >
            <Text style={[styles.texto, { color: colors.buttonText }]}>
              Latitude: {loc.latitude.toFixed(5)}
            </Text>
            <Text style={[styles.texto, { color: colors.buttonText }]}>
              Longitude: {loc.longitude.toFixed(5)}
            </Text>
            <Text style={[styles.texto, { color: colors.buttonText }]}>
              Data: {new Date(loc.timestamp).toLocaleString()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  titulo: {
    fontSize: width * 0.06,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  localizacaoItem: {
    padding: width * 0.04,
    borderBottomWidth: 1,
    borderRadius: 10,
    marginBottom: 12,
  },
  texto: {
    fontSize: width * 0.04,
    marginBottom: 5,
  },
});

export default ListarLocalizacoesPulseira;
