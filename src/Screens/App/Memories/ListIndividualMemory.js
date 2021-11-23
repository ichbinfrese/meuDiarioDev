import React from 'react';
import { View, StyleSheet, Dimensions, Text, ScrollView, SafeAreaView, Image } from 'react-native';
import { Audio } from 'expo-av';
import { GetFormattedDate } from '../../../Components/Date';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Button, Card } from 'react-native-paper';
import 'react-native-get-random-values';
import { v4 as uuidV4 } from 'uuid';
import firebase from 'firebase';
import Fire from '../../../Components/Fire';
import { useEffect } from 'react/cjs/react.production.min';

export default function ListIndividualMemory({ route, navigation }) {

    const { user, card } = route.params;
    const date = new Date();
    const [image, setImage] = React.useState(null);

    React.useEffect(() => {
        loadImage()

        async function loadImage() {
            if (card.imageId) {
                const image = await firebase.storage().ref("images").child(card.imageId).getDownloadURL()
                setImage(image)
            }
        }
    })

    function editMemory() {
        navigation.navigate('EditMemory', {
            user, card, image
        })
    }

    function deleteMemory() {
        Fire.remove(`memories/${user.uid}`, card.id);
        navigation.goBack();
    }

    return (
        <View style={styles.screen}>
            <SafeAreaView style={styles.safeAreaView}>
                <ScrollView showsVerticalScrollIndicator={false}>

                    <Text style={styles.date}>{GetFormattedDate(date)}</Text>

                    <Text style={styles.title}>{card.title}</Text>

                    {card.imageId && (
                        <View>
                            <Image style={styles.image} source={{ uri: image }} />
                        </View>
                    )}

                    <Text style={styles.subtitle}>{card.subtitle}</Text>

                    <View style={styles.btnContainer}>
                        <Button icon="pencil" style={styles.button} color="white" onPress={editMemory}>
                            Editar
                        </Button>

                        <Button icon="delete" style={styles.button} color="white" onPress={deleteMemory}>
                            Apagar
                        </Button>

                    </View>
                    <View><Button color="#007FFF" mode='contained' onPress={() => navigation.goBack()}>Voltar</Button></View>

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

    title: {
        color: '#007FFF',
        alignSelf: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
    },

    image: {
        marginTop: 5,
        height: 0.2*Dimensions.get('screen').height,
        borderRadius: 5
    },

    subtitle: {
        alignSelf: 'center',
        marginTop: 10,
    },

    btnContainer: {
        marginHorizontal: 0.05*Dimensions.get('screen').width,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 50,
        borderRadius: 5,
        marginBottom: 50
    },


    button: {
        backgroundColor: '#007FFF',
        width: 0.4*Dimensions.get('screen').width,
    }


})