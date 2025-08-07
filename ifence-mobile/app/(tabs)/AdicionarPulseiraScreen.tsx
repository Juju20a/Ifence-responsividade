import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { Picker } from "@react-native-picker/picker";

import Header from "@/components/Header";
import { useDaltonicColors } from "../hooks/useDaltonicColors";
import { useCercas } from "../../components/Cercas/hooks/useCercas";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Pulseira = {
  id: string;
  nome: string;
  ativa: boolean;
  cercaId: string;
};

const PULSEIRAS_STORAGE = "@pulseiras";

const AdicionarPulseiraScreen: React.FC = () => {
  const router = useRouter();
  const colors = useDaltonicColors();
  const { cercas } = useCercas();

  // Estados principais
  const [nomePulseira, setNomePulseira] = useState("");
  const [pulseiras, setPulseiras] = useState<Pulseira[]>([]);
  const [cercaSelecionada, setCercaSelecionada] = useState<string>("");

  // Edição
  const [editandoIndex, setEditandoIndex] = useState<number | null>(null);
  const [novoNomePulseira, setNovoNomePulseira] = useState("");

  // Carregar pulseiras do AsyncStorage ao iniciar
  useEffect(() => {
    (async () => {
      try {
        const pulseirasSalvas = await AsyncStorage.getItem(PULSEIRAS_STORAGE);
        if (pulseirasSalvas) setPulseiras(JSON.parse(pulseirasSalvas));
      } catch (error) {
        console.error("Erro ao carregar pulseiras:", error);
      }
    })();
  }, []);

  // Salvar pulseiras no AsyncStorage
  const salvarPulseiras = async (novasPulseiras: Pulseira[]) => {
    try {
      await AsyncStorage.setItem(PULSEIRAS_STORAGE, JSON.stringify(novasPulseiras));
    } catch (error) {
      console.error("Erro ao salvar pulseiras:", error);
    }
  };

  // Adicionar nova pulseira
  const adicionarPulseira = () => {
    if (!nomePulseira.trim() || !cercaSelecionada) {
      Toast.show({ type: "error", text1: "Preencha todos os campos!" });
      return;
    }
    const novaPulseira: Pulseira = {
      id: Math.random().toString(36).substr(2, 9),
      nome: nomePulseira.trim(),
      ativa: true,
      cercaId: cercaSelecionada,
    };
    const novasPulseiras = [...pulseiras, novaPulseira];
    setPulseiras(novasPulseiras);
    salvarPulseiras(novasPulseiras);
    setNomePulseira("");
    setCercaSelecionada("");
    Toast.show({ type: "success", text1: "Pulseira adicionada!" });
  };

  // Iniciar edição de pulseira existente
  const iniciarEdicao = (index: number) => {
    setEditandoIndex(index);
    setNovoNomePulseira(pulseiras[index].nome);
    setCercaSelecionada(pulseiras[index].cercaId);
  };

  // Cancelar edição
  const cancelarEdicao = () => {
    setEditandoIndex(null);
    setNovoNomePulseira("");
    setCercaSelecionada("");
  };

  // Salvar edição de pulseira
  const salvarEdicao = () => {
    if (editandoIndex === null) return;

    if (!novoNomePulseira.trim() || !cercaSelecionada) {
      Toast.show({ type: "error", text1: "Preencha todos os campos!" });
      return;
    }

    const novasPulseiras = [...pulseiras];
    novasPulseiras[editandoIndex] = {
      ...novasPulseiras[editandoIndex],
      nome: novoNomePulseira.trim(),
      cercaId: cercaSelecionada,
    };
    setPulseiras(novasPulseiras);
    salvarPulseiras(novasPulseiras);
    cancelarEdicao();
    Toast.show({ type: "success", text1: "Pulseira editada!" });
  };

  // Excluir pulseira
  const deletarPulseira = (index: number) => {
    const novasPulseiras = pulseiras.filter((_, i) => i !== index);
    setPulseiras(novasPulseiras);
    salvarPulseiras(novasPulseiras);
    cancelarEdicao();
    Toast.show({ type: "info", text1: "Pulseira excluída!" });
  };

  // Alternar ativação da pulseira
  const alternarSwitch = (index: number, novoValor: boolean) => {
    const novasPulseiras = [...pulseiras];
    novasPulseiras[index].ativa = novoValor;
    setPulseiras(novasPulseiras);
    salvarPulseiras(novasPulseiras);
  };

  return (
    <View style={{ flex: 1 }}>
      <Header />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={[styles.titulo, { color: colors.title }]}>Adicionar pulseira</Text>

          {/* Formulário para adicionar nova pulseira */}
          <View style={[styles.card, { backgroundColor: colors.infoBox, borderColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.title }]}>Nome da pulseira:</Text>
            <TextInput
              style={[styles.input, { color: colors.title, borderColor: colors.border, backgroundColor: colors.background }]}
              value={nomePulseira}
              onChangeText={setNomePulseira}
              placeholder="Digite o nome"
              placeholderTextColor={colors.subtitle}
            />

            <Text style={[styles.label, { color: colors.title }]}>Selecione uma cerca:</Text>
            <Picker
              selectedValue={cercaSelecionada}
              onValueChange={(itemValue) => setCercaSelecionada(itemValue)}
              style={{ color: colors.title }}
            >
              <Picker.Item label="Selecione uma cerca" value="" />
              {cercas.map((cerca) => (
                <Picker.Item key={cerca.id} label={cerca.nome} value={cerca.id} />
              ))}
            </Picker>

            <View style={styles.botoes}>
              <TouchableOpacity
                style={[styles.botaoAdicionar, { backgroundColor: colors.button }]}
                onPress={adicionarPulseira}
              >
                <Text style={[styles.textoBotao, { color: colors.buttonText }]}>Adicionar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.botaoCancelar, { backgroundColor: colors.button }]}
                onPress={() => router.back()}
              >
                <Text style={[styles.textoBotao, { color: colors.buttonText }]}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Lista de pulseiras cadastradas */}
          <Text style={[styles.titulo, { color: colors.title }]}>Pulseiras Cadastradas:</Text>

          {pulseiras.length === 0 && (
            <Text style={[styles.semPulseiras, { color: colors.subtitle }]}>Nenhuma pulseira cadastrada.</Text>
          )}

          {pulseiras.map((item, index) => {
            const cercaAtribuida = cercas.find((c) => c.id === item.cercaId);
            const estaEditando = editandoIndex === index;

            return (
              <View
                key={item.id}
                style={[styles.card, { backgroundColor: colors.infoBox, borderColor: colors.border }]}
              >
                {estaEditando ? (
                  <>
                    <TextInput
                      style={[styles.input, { color: colors.title, borderColor: colors.border, backgroundColor: colors.background }]}
                      value={novoNomePulseira}
                      onChangeText={setNovoNomePulseira}
                      placeholder="Editar nome da pulseira"
                      placeholderTextColor={colors.subtitle}
                    />
                    <Picker
                      selectedValue={cercaSelecionada}
                      onValueChange={(itemValue) => setCercaSelecionada(itemValue)}
                      style={{ color: colors.title }}
                    >
                      <Picker.Item label="Selecione uma cerca" value="" />
                      {cercas.map((cerca) => (
                        <Picker.Item key={cerca.id} label={cerca.nome} value={cerca.id} />
                      ))}
                    </Picker>

                    <View style={styles.botoes}>
                      <TouchableOpacity
                        style={[styles.botaoSalvarEdicao, { backgroundColor: colors.button }]}
                        onPress={salvarEdicao}
                      >
                        <Text style={[styles.textoBotao, { color: colors.buttonText }]}>Salvar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.botaoCancelarEdicao, { backgroundColor: colors.button }]}
                        onPress={cancelarEdicao}
                      >
                        <Text style={[styles.textoBotao, { color: colors.buttonText }]}>Cancelar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.botaoExcluir, { backgroundColor: colors.button }]}
                        onPress={() => deletarPulseira(index)}
                      >
                        <Text style={[styles.textoBotao, { color: colors.buttonText }]}>Excluir</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <TouchableOpacity onPress={() => iniciarEdicao(index)}>
                    <Text style={[styles.item, { color: colors.title }]}>{item.nome}</Text>
                  </TouchableOpacity>
                )}

                <Text style={[styles.cercaInfo, { color: colors.title }]}>
                  Cerca: {cercaAtribuida ? cercaAtribuida.nome : "Não atribuída"}
                </Text>

                <Switch
                  value={item.ativa}
                  onValueChange={(novoValor) => alternarSwitch(index, novoValor)}
                  trackColor={{ false: colors.infoBox, true: colors.button }}
                  thumbColor={item.ativa ? colors.button : colors.infoBox}
                />

                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/Screens/ListarLocalizacoesPulseira",
                      params: { pulseiraId: item.id, cercaId: item.cercaId },
                    })
                  }
                >
                  <Text style={[styles.textoBotaoVerLocalizacoes, { color: colors.title }]}>
                    Ver Localizações
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      </View>
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  titulo: {
    fontSize: 27,
    fontWeight: "600",
    marginVertical: 10,
  },
  card: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
  },
  label: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    padding: 8,
    fontSize: 18,
    borderRadius: 5,
    marginBottom: 20,
  },
  botoes: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
  },
  botaoAdicionar: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  botaoCancelar: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  botaoSalvarEdicao: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    flex: 1,
    maxWidth: 120,
    alignItems: "center",
    marginHorizontal: 5,
    marginBottom: 10,
  },
  botaoCancelarEdicao: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    flex: 1,
    maxWidth: 120,
    marginBottom: 10,
    marginHorizontal: 5,
    alignItems: "center",
  },
  botaoExcluir: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    flex: 1,
    alignItems: "center",
    marginHorizontal: 5,
    marginBottom: 10,
  },
  textoBotao: {
    fontSize: 18,
    textAlign: "center",
  },
  item: {
    fontSize: 18,
    paddingVertical: 5,
  },
  cercaInfo: {
    fontSize: 14,
    marginVertical: 8,
  },
  textoBotaoVerLocalizacoes: {
    fontSize: 17,
    marginTop: 5,
  },
  semPulseiras: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 10,
  },
});

export default AdicionarPulseiraScreen;
