import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from "react-native";
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { Link, useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import { useDaltonicColors } from "../hooks/useDaltonicColors";

const { width, height } = Dimensions.get("window");

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const Map = () => {
  const colors = useDaltonicColors();
  const [location, setLocation] = useState<null | { latitude: number; longitude: number }>(null);
  const mapRef = useRef<MapView | null>(null);

  const params = useLocalSearchParams();
  const raio = Number(params.raio);

  const [mapType, setMapType] = useState<"standard" | "hybrid">("standard");

  const toggleMapType = () => {
    setMapType((prevType) => (prevType === "standard" ? "hybrid" : "standard"));
  };

  useEffect(() => {
    const getLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permissão negada",
            "Você precisa permitir o acesso à localização."
          );
          return;
        }

        let { coords } = await Location.getCurrentPositionAsync({});
        const userLocation = {
          latitude: coords.latitude,
          longitude: coords.longitude,
        };
        setLocation(userLocation);

        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          });
        }
      } catch (error) {
        Alert.alert("Erro", "Não foi possível obter a localização.");
      }
    };

    getLocation();
  }, []);

  const handleMapPress = (e: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setLocation({ latitude, longitude });

    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MapView
        style={StyleSheet.absoluteFill}
        ref={mapRef}
        mapType={mapType}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: location?.latitude ?? 0,
          longitude: location?.longitude ?? 0,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
        onPress={handleMapPress}
        showsUserLocation={true}
      >
        {location && (
          <>
            <Marker coordinate={location}>
              <Image source={require("@/assets/images/IconLocation.png")} />
            </Marker>
            <Circle
              center={location}
              radius={raio}
              strokeWidth={2}
              strokeColor="rgba(0, 0, 255, 0.5)"
              fillColor="rgba(0, 0, 255, 0.2)"
            />
          </>
        )}
      </MapView>

      <Link href={"/Screens/AddCerca"} asChild>
        <TouchableOpacity style={styles.button}>
          <AntDesign name="arrowleft" size={35} color={colors.title} />
        </TouchableOpacity>
      </Link>

      <Link
        href={{
          pathname: "/(tabs)/ListarCercas",
          params: {
            latitude: location?.latitude?.toString(),
            longitude: location?.longitude?.toString(),
            from: "modal",
          },
        }}
        asChild
      >
        <TouchableOpacity
          style={[styles.BtnconfirmLocation, { backgroundColor: colors.button }]}
        >
          <Text style={[styles.textConfirmLocation, { color: colors.buttonText }]}>
            Confirmar localização
          </Text>
        </TouchableOpacity>
      </Link>

      <TouchableOpacity style={styles.bn} onPress={toggleMapType}>
        <MaterialIcons style={styles.iconLayer} name="layers" size={18} />
        <Text style={[styles.buttonText, { color: "#fff" }]}>
          {mapType === "standard" ? "Modo Híbrido" : "Modo Padrão"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    backgroundColor: "transparent",
    position: "absolute",
    top: 40,
    left: 20,
    borderRadius: 10,
    padding: 5,
  },
  BtnconfirmLocation: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 5,
    elevation: 3,
  },
  textConfirmLocation: {
    fontSize: 16,
    fontWeight: "600",
  },
  bn: {
    position: "absolute",
    top: 70,
    right: 10,
    backgroundColor: "#003F88",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  iconLayer: {
    paddingRight: 5,
    color: "#ffffff",
  },
});

export default Map;
