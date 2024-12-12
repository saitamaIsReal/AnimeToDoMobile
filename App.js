import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ImageBackground,
  FlatList,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as Font from "expo-font";



export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false); // Schriftart-Zustand
  const [tasks, setTasks] = useState([
    { id: "1", text: "Deine Aufgaben", completed: false, favorite: false },
  ]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const soundEffectComplete = useRef(new Audio.Sound()); // Sound für Abhaken
  const soundEffectDelete = useRef(new Audio.Sound()); // Sound für Löschen

  // Schriftarten und Sounds laden
  useEffect(() => {
    const loadResources = async () => {
      await Font.loadAsync({
        MyCustomFont: require("./assets/fonts/KOMIKAX_.ttf"),
        ImpactFont: require("./assets/fonts/impact.ttf"),
      });

      await soundEffectComplete.current.loadAsync(require("./assets/hit.mp3"));
      await soundEffectDelete.current.loadAsync(require("./assets/bin.mp3"));

      setFontsLoaded(true);
    };
    loadResources();
  }, []);

  // Hintergrundmusik laden und abspielen
  const sound = useRef(new Audio.Sound());
  useEffect(() => {
    const loadMusic = async () => {
      try {
        await sound.current.loadAsync(require("./assets/lofii.mp3"));
        await sound.current.setIsLoopingAsync(true);
        await sound.current.playAsync();
      } catch (error) {
        console.error("Fehler beim Abspielen der Musik:", error);
      }
    };

    loadMusic();

    return () => {
      sound.current.unloadAsync();
    };
  }, []);

  // Ladebildschirm anzeigen, bis Ressourcen geladen sind
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ fontSize: 18, color: "gray" }}>
          Lade Schriftarten...
        </Text>
      </View>
    );
  }

  const getCurrentDate = () => {
    const date = new Date();
    const options = { weekday: "long", day: "numeric", month: "long" };
    return date.toLocaleDateString("de-DE", options);
  };

  const addTask = () => {
    const newTask = {
      id: Date.now().toString(),
      text: "Neue Aufgabe",
      completed: false,
      favorite: false,
    };
    setTasks([...tasks, newTask]);
  };

  const toggleComplete = async (id) => {
    await soundEffectComplete.current.replayAsync();
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
  };

  const toggleFavorite = (id) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, favorite: !task.favorite } : task
    );
    setTasks(updatedTasks);
  };

  const deleteTask = async (id) => {
    await soundEffectDelete.current.replayAsync();
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
  };

  const startEditing = (id, text) => {
    setEditingTaskId(id);
    setEditingText(text);
  };

  const saveTask = (id) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, text: editingText } : task
    );
    setTasks(updatedTasks);
    setEditingTaskId(null);
    setEditingText("");
  };

  return (
    <ImageBackground
      source={require("./assets/anime-background.png")}
      style={styles.background}
    >
      <View style={styles.container}>
        {/* Header */}
        <Text style={[styles.header, { fontFamily: "MyCustomFont" }]}>
          MEINE AUFGABEN
        </Text>
        <Text style={[styles.subheader, { fontFamily: "ImpactFont" }]}>
          {getCurrentDate()}
        </Text>

        {/* Aufgaben-Liste */}
        <FlatList
          data={tasks}
          renderItem={({ item }) => (
            <View style={styles.taskItem}>
              {/* Checkbox */}
              <TouchableOpacity onPress={() => toggleComplete(item.id)}>
                <MaterialIcons
                  name={
                    item.completed ? "check-box" : "check-box-outline-blank"
                  }
                  size={24}
                  color="yellow"
                />
              </TouchableOpacity>

              {/* Task Text oder Input */}
              <View style={styles.textContainer}>
                {editingTaskId === item.id ? (
                  <TextInput
                    style={[
                      styles.taskText,
                      {
                        fontFamily: "MyCustomFont",
                        textDecorationLine: item.completed
                          ? "line-through"
                          : "none",
                      },
                    ]}
                    value={editingText}
                    onChangeText={setEditingText}
                    onBlur={() => saveTask(item.id)}
                  />
                ) : (
                  <TouchableOpacity
                    onPress={() => startEditing(item.id, item.text)}
                  >
                    <Text
                      style={[
                        styles.taskText,
                        {
                          fontFamily: "MyCustomFont",
                          textDecorationLine: item.completed
                            ? "line-through"
                            : "none",
                        },
                      ]}
                    >
                      {item.text}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Icons (Star + Delete) */}
              <View style={styles.iconContainer}>
                <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
                  <MaterialIcons
                    name="star"
                    size={24}
                    color={item.favorite ? "yellow" : "gray"}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteTask(item.id)}>
                  <MaterialIcons name="delete" size={24} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id}
        />

        {/* Button zum Hinzufügen */}
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <MaterialIcons name="add" size={32} color="white" />
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const screenWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
  },
  header: {
    fontSize: 28,
    color: "white",
    marginTop: 40,
    textShadowColor: "black",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subheader: {
    fontSize: 16,
    color: "white",
    marginBottom: 20,
    textShadowColor: "black",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
    width: screenWidth * 0.9,
    justifyContent: "space-between", // Trenne Text und Icons
  },

  taskText: {
    flex: 1, // Nimmt den restlichen Platz ein
    fontSize: 18,
    color: "white",
    marginLeft: 10,
    textAlign: "left", // Text immer links ausrichten
  },
  favoriteIcon: {
    marginLeft: 10,
  },
  deleteIcon: {
    marginLeft: 10,
  },
  addButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "red",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end", // Icons nach rechts ausrichten
    gap: 10, // Abstand zwischen den Icons
  },
  textContainer: {
    flex: 1, // Nimmt den verfügbaren Platz ein
    marginHorizontal: 10, // Abstand zwischen Checkbox und Icons
  },
}); 