import React from 'react';
import { View, StyleSheet, Dimensions, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Audio } from 'expo-av';
import { GetFormattedDate } from '../../../Components/Date';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Button } from 'react-native-paper';
import 'react-native-get-random-values';
import { v4 as uuidV4 } from 'uuid';
import firebase from 'firebase';
import Fire from '../../../Components/Fire';

let recording = new Audio.Recording();

export default function EditNote({ route, navigation }) {

    const { user, card, recordedURI: audio } = route.params;

    const date = card.date;
    const [title, setTitle] = React.useState(card.title);
    const [note, setNote] = React.useState(card.note);
    const [recordedURI, setRecordedURI] = React.useState(audio);

    const [AudioPerm, setAudioPerm] = React.useState(false);
    const [isRecording, setIsRecording] = React.useState(false);
    const [isPlaying, setIsPlaying] = React.useState(false);
    const Player = React.useRef(new Audio.Sound());

    React.useEffect(() => {
        GetPermission();
      }, []);

    async function GetPermission() {
        const getAudioPerm = await Audio.requestPermissionsAsync();
        setAudioPerm(getAudioPerm.granted);
    };

    async function startRecording() {
        if (AudioPerm === true) {
            try {
                await recording.prepareToRecordAsync(
                    Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
                );
                await recording.startAsync();
                setIsRecording(true);
            } catch (error) {
                console.log(error);
            }
        } else {
            GetPermission();
        }
    };

    async function stopRecording() {
        try {
            await recording.stopAndUnloadAsync();
            const result = recording.getURI();
            setRecordedURI(result);
            recording = new Audio.Recording();
            setIsRecording(false);
          } catch (error) {
            console.log(error);
          }
      }

    async function playSound() {
        try {
            await Player.current.unloadAsync()
            await Player.current.loadAsync(
                { uri: recordedURI },
                {},
                true
            );
        
            const response = await Player.current.getStatusAsync();
            if (response.isLoaded) {
                if (response.isPlaying == false) {
                    setIsPlaying(true);
                    await Player.current.playAsync();
                    setTimeout(function () {
                        setIsPlaying(false)
                    }, response.playableDurationMillis)
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    async function stopSound() {
        try {
          const checkLoading = await Player.current.getStatusAsync();
          if (checkLoading.isLoaded === true) {
            await Player.current.stopAsync();
            setIsPlaying(false);
          }
        } catch (error) {
          console.log(error);
        }
      };

      async function saveFunction() {
        if (title && note) {
            try {
                let audioId = null

                if(recordedURI !== audio) {
                    audioId = uuidV4()

                    const audioRef = firebase.storage().ref().child(`audios/${audioId}`)

                    const metadata = {
                        contentType: 'audio/mp3'
                    }

                    const file = await new Promise((resolve, reject) => {
                        var xhttp = new XMLHttpRequest();
                        xhttp.onerror = function (error) {
                            reject(new Error('error'));
                        };

                        xhttp.onload = function () {
                            resolve(xhttp.response);
                        };

                        xhttp.responseType = 'blob';
                        xhttp.open("GET", recordedURI, true);
                        xhttp.send();
                    })

                    await audioRef.put(file, metadata)
                } else if (card.audioId == undefined) {
                    audioId = null
                } else {
                    audioId = card.audioId
                }
                
                await Fire.update(`notes/${user.uid}`, {
                    id: card.id,
                    title,
                    note,
                    date,
                    audioId
                }, card.id);
                navigation.goBack()
                navigation.goBack()
            } catch (error) {
                console.log(error)
            }
        } else {
            console.log('Preencha todos os campos!')
        }
    }

    return (
        <View style={styles.screen}>

            <SafeAreaView style={styles.safeAreaView}>
                <ScrollView showsVerticalScrollIndicator={false}>
            
                    <Text style={styles.date}>{GetFormattedDate(date)}</Text>

                    <Text style={styles.label}>Título</Text>
                    <TextInput value={title} onChangeText={title => setTitle(title)} maxLength={100} style={styles.title} />

                    <Text style={styles.label}>Nota</Text>
                    <TextInput value={note} onChangeText={note => setNote(note)} multiline={true} numberOfLines={15} maxLength={3000} style={styles.note} />

                    <Text style={styles.label}>Anexar áudio</Text>
                    <View style={styles.audioView}>
                        <TouchableOpacity onPress={isRecording ? () => stopRecording() : () => startRecording()} >
                            <MaterialCommunityIcons name={isRecording ? 'check' : 'microphone'} style={styles.micButton} size={40} color='white'/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={isPlaying ? () => stopSound : () => playSound()} >
                            <MaterialCommunityIcons name={isPlaying ? 'pause' : 'play'} style={styles.micButton} size={40} color='white' />
                        </TouchableOpacity>
                    </View>

                    <Button icon="download" style={styles.save} color="white" onPress={saveFunction}>
                    Salvar
                    </Button>

                </ScrollView>
            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({
    screen: { 
		backgroundColor: '#03A89E',
		height: Dimensions.get('screen').height,
		width: Dimensions.get('screen').width,
		justifyContent: 'flex-start',
		alignItems: 'center'
	},

    safeAreaView: {
        marginBottom: 160,
        width: 0.92*Dimensions.get('screen').width,        
    },

    date: {
        alignSelf: 'center',
        marginVertical: 10,
        fontSize: 16,
        fontWeight: 'bold'
    },
    
    label: {
        marginTop: 10,
        alignSelf: 'flex-start',
        fontWeight: 'bold'
    },

    title: {
        fontSize: 20,
        padding: 10,
        backgroundColor: 'white',
        marginBottom: 5,
        borderRadius: 5,
    },

    note: {
        textAlignVertical: 'top',
        fontSize: 20,
        padding: 10,
        backgroundColor: 'white',
        marginBottom: 5,
        borderRadius: 5,
    },

    audioView: {
        alignSelf: 'center',
        flexDirection: 'row',
    },

    micButton: {
        padding: 5,
        backgroundColor: '#007FFF',
        borderRadius: 5,
        marginHorizontal: 5,
    },

    save: {
        alignSelf: 'center',
        marginTop: 50,
        backgroundColor: '#007FFF',
        width: 0.4*Dimensions.get('screen').width,
        borderRadius: 5,
        marginBottom: 50
    }
}) 