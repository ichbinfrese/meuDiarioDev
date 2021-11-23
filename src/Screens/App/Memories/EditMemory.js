import React from 'react';
import { View, StyleSheet, Dimensions, Text, TextInput, ScrollView, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import { GetFormattedDate } from '../../../Components/Date';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Button, Portal, Dialog } from 'react-native-paper';
import 'react-native-get-random-values';
import { v4 as uuidV4 } from 'uuid';
import firebase from 'firebase';
import Fire from '../../../Components/Fire';

export default function CreateMemory({ route, navigation }) {

    const { user, card, image: cardImage } = route.params;

    const date = card.date;
    const [title, setTitle] = React.useState(card.title);
    const [subtitle, setNote] = React.useState(card.subtitle);
    const [image, setImage] = React.useState(cardImage);
    const [cameraOrImage, setCameraOrImage] = React.useState(false);
    const [cameraVisible, setCameraVisible] = React.useState(false)
    const camRef = React.useRef(null);

    async function saveFunction() {
        if (title && subtitle && image) {
            try {
                let imageId = null;

                if (image !== cardImage) {
                    const file = await new Promise((resolve, reject) => {
                        var xhttp = new XMLHttpRequest();
                        xhttp.onerror = function (error) {
                            reject(new Error('error'));
                        };

                        xhttp.onload = function () {
                            resolve(xhttp.response);
                        };

                        xhttp.responseType = 'blob';
                        xhttp.open("GET", image, true);
                        xhttp.send();
                    })

                    imageId = uuidV4();
                    const metadata = {
                        contentType: 'image/jpg'
                    }

                    await firebase.storage().ref().child(`images/${imageId}`).put(file, metadata)
                } else if (card.imageId == undefined) {
                    imageId = null
                } else {
                    imageId = card.imageId
                }

                await Fire.update(`memories/${user.uid}`, {
                    id: card.id,
                    title,
                    subtitle,
                    date,
                    imageId
                }, card.id,);
                navigation.goBack()
                navigation.goBack()
            } catch (error) {
                console.log(error)
            }
        } else {
            console.log('Preencha todos os campos!')
        }
    }

    async function selectImage() {
        setCameraOrImage(false)
        await ImagePicker.requestMediaLibraryPermissionsAsync();
        const image = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images
        });
        if(!image.cancelled) {
            setImage(image.uri)
        };
    };

    async function openCamera() {
        setCameraOrImage(false)
        const { status } = await Camera.requestPermissionsAsync();
        if(status) {
            setCameraVisible(true)
        } else {
            console.log("Acesso à câmera negado!")
        }
    }
    
    async function takePicture() {
        if (camRef) {
            const data = await camRef.current.takePictureAsync();
            setImage(data.uri);
            setCameraVisible(false)
        }
    }



    return (
        <View style={styles.screen}>

            <SafeAreaView style={styles.safeAreaView}>
                <ScrollView showsVerticalScrollIndicator={false}>
            
                    <Text style={styles.date}>{GetFormattedDate(date)}</Text>

                    <Text style={styles.label}>Título</Text>
                    <TextInput value={title} onChangeText={title => setTitle(title)} maxLength={100} style={styles.title} />

                    <Text style={styles.label}>Legenda</Text>
                    <TextInput value={subtitle} onChangeText={subtitle => setNote(subtitle)} multiline={true} numberOfLines={7} maxLength={300} style={styles.subtitle} />

                    <Button icon="image" style={styles.imageButton} color="white" onPress={() => setCameraOrImage(true)}>
                    Anexar imagem
                    </Button>

                    {image && (
                        <View>
                            <Image style={styles.image} source={{ uri: image }} />
                        </View>
                    )}

                    <Button icon="download" style={styles.save} color="white" onPress={saveFunction}>
                    Salvar
                    </Button>

                </ScrollView>
            </SafeAreaView>

            <Portal>
                <Dialog
                    visible={cameraOrImage}
                    dismissable={true}
                    onDismiss={() => setCameraOrImage(false)}
                >
                    <Dialog.Title>Preencha todos os campos!</Dialog.Title>
                    <Dialog.Content>
                        <Button
                            icon="camera"
                            onPress={openCamera}
                        >
                            Câmera
                        </Button>
                        <Button
                            icon="image"
                            onPress={selectImage}
                        >
                            Galeria
                        </Button>
                    </Dialog.Content>
                </Dialog>

                {cameraVisible && (
                    <Camera
                    style={{flex: 1,width:"100%"}}
                    ref={camRef}
                    >
                        <View
                            style={{
                            position: 'absolute',
                            bottom: 0,
                            flexDirection: 'row',
                            flex: 1,
                            width: '100%',
                            padding: 20,
                            justifyContent: 'space-between'
                            }}
                        >
                            <View
                            style={{
                            alignSelf: 'center',
                            flex: 1,
                            alignItems: 'center'
                            }}
                            >
                                <TouchableOpacity
                                onPress={takePicture}
                                style={{
                                width: 70,
                                height: 70,
                                bottom: 0,
                                borderRadius: 50,
                                backgroundColor: '#fff'
                                }}
                                />
                            </View>
                        </View>
                    </Camera>
                )}
            </Portal>

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

    subtitle: {
        textAlignVertical: 'top',
        fontSize: 20,
        padding: 10,
        backgroundColor: 'white',
        marginBottom: 5,
        borderRadius: 5,
    },



    imageButton: {
        marginTop: 10,
        alignSelf: 'center',
        backgroundColor: '#007FFF',
        width: 0.92*Dimensions.get('screen').width,
        borderRadius: 5,
    },

    image: {
        marginTop: 5,
        height: 0.2*Dimensions.get('screen').height,
        borderRadius: 5
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