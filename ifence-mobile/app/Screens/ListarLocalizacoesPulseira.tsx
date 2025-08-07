export const options = {
  headerShown: false,
};
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useDaltonicColors } from "../hooks/useDaltonicColors";

type Localizacao = {
  latitude: number;
  longitude: number;
  timestamp: string;
};
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
        cercaId, // Adicionado para garantir que o cercaId seja passado
      },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }] }>
      <Text style={[styles.titulo, { color: colors.title }]}>Histórico de Localizações da Pulseira</Text>
      <ScrollView>
        {localizacoes.map((loc, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.localizacaoItem, { backgroundColor: colors.button, borderBottomColor: colors.border }]}
            onPress={() => abrirMapaComLocalizacao(loc)}
          >
            <Text style={[styles.texto, { color: colors.buttonText }] }>
              Latitude: {loc.latitude.toFixed(5)}
            </Text>
            <Text style={[styles.texto, { color: colors.buttonText }] }>
              Longitude: {loc.longitude.toFixed(5)}
            </Text>
            <Text style={[styles.texto, { color: colors.buttonText }] }>
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
    padding: 20,
    // backgroundColor: "#FFFFFF", // agora controlado pelo hook
  },
  titulo: {
    fontSize: 24,
    // color: "#004A99", // agora controlado pelo hook
    fontWeight: "bold",
    marginBottom: 20,
  },
  localizacaoItem: {
    padding: 15,
    borderBottomWidth: 1,
    // borderBottomColor: "#FFFFFF", // agora controlado pelo hook
    // backgroundColor: '#003F88', // agora controlado pelo hook
    borderRadius: 4
  },
  texto: {
    fontSize: 16,
    // color: '#FFFFFF' // agora controlado pelo hook
  },
});

export default ListarLocalizacoesPulseira;
