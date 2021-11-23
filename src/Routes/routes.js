import React from 'react';
import { StatusBar } from 'react-native';
import { DefaultTheme, IconButton, Provider, } from 'react-native-paper';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import firebase from 'firebase';

import Welcome from '../Screens/Auth/Welcome';
import Login from '../Screens/Auth/Login';
import CreateAccount from '../Screens/Auth/CreateAccount';

import ListNotes from '../Screens/App/Notes/ListNotes'
import CreateNote from '../Screens/App/Notes/CreateNote';
import ListIndividualNote from '../Screens/App/Notes/ListIndividualNote';
import EditNote from '../Screens/App/Notes/EditNote';

import ListMemories from '../Screens/App/Memories/ListMemories';
import CreateMemory from '../Screens/App/Memories/CreateMemory';
import ListIndividualMemory from '../Screens/App/Memories/ListIndividualMemory';
import EditMemory from '../Screens/App/Memories/EditMemory';

const Stack = createStackNavigator();
const Tab = createMaterialBottomTabNavigator();

const theme = {
	...DefaultTheme,
	roundness: 5,
	colors: {
	  ...DefaultTheme.colors,
	  background: '#007FFF',
	  primary: '#007FFF',
	  text: '#007FFF'
	},
  };

export default function Routes() {
	return (
		<Provider>
			<StatusBar
				animated={true}
				backgroundColor="#007FFF"
				barStyle={'light-content'}
			/>
			<NavigationContainer theme={theme}>
				<Stack.Navigator >					
					<Stack.Screen name="AuthRoutes" component={AuthRoutes} options={{ headerShown: false }} />
					<Stack.Screen name="AppRoutes" component={AppRoutes} options={{ headerShown: false }}/>
				</Stack.Navigator>
			</NavigationContainer>
		</Provider>
	)
}

function AuthRoutes() {
	return (
		<Stack.Navigator>
			<Stack.Screen name="Welcome" component={Welcome} options={{headerShown: false}} />
			<Stack.Screen name="Login" component={Login} options={{headerShown: false}} />
			<Stack.Screen name="CreateAccount" component={CreateAccount} options={{headerShown: false}} />
		</Stack.Navigator>
	)
}

function AppRoutes() {

	return (
		<Tab.Navigator initialRouteName="Notes">
			<Tab.Screen
				name="Notes"
				component={Notes}
				options={({ navigation, route })=> ({
                    tabBarLabel: "Notas",
                    tabBarIcon: ({color}) => (
                        <MaterialCommunityIcons name="book" color={color} size={26} />
                    )
                })}/>
			<Tab.Screen
				name="Memories"
				component={Memories}
				options={({ navigation, route })=> ({
                    tabBarLabel: "Memórias",
                    tabBarIcon: ({color}) => (
                        <MaterialCommunityIcons name="play-circle" color={color} size={26} />
                    )
                })}
			/>
		</Tab.Navigator>
	  );
}

function Notes() {
	return (
		<Stack.Navigator
			screenOptions={{
				headerTintColor: 'white',
				headerTitleAlign: 'center',
				headerLeft: null,
			}}
		>
			<Stack.Screen
				name="ListNotes"
				component={ListNotes}
				options={{
					title: "Minhas Notas",
					headerLeft: () => Logout(),
				}}
			/>
			<Stack.Screen
				name="CreateNote"
				component={CreateNote}
				options={{
					title: "Criar Nota",
				}}
			/>
			<Stack.Screen
				name="ListIndividualNote"
				component={ListIndividualNote}
				options={{
					title: "Visualizar Nota",
				}}
			/>
			<Stack.Screen
				name="EditNote"
				component={EditNote}
				options={{
					title: "Editar Nota",
				}}
			/>
		</Stack.Navigator>
	)
}

function Memories() {
	return (
		<Stack.Navigator
			screenOptions={{
				headerTintColor: 'white',
				headerTitleAlign: 'center',
				headerLeft: null,
			}}
		>
			<Stack.Screen
				name="ListMemories"
				component={ListMemories}
				options={{
					title: "Minhas Memórias",
					headerLeft: () => Logout(),
				}}
			/>
			<Stack.Screen
				name="CreateMemory"
				component={CreateMemory}
				options={{
					title: "Criar Memória",
				}}
			/>
			<Stack.Screen
				name="ListIndividualMemory"
				component={ListIndividualMemory}
				options={{
					title: "Visualizar Memória",
				}}
			/>
			<Stack.Screen
				name="EditMemory"
				component={EditMemory}
				options={{
					title: "Editar Memória",
				}}
			/>
		</Stack.Navigator>
	)
}

function Logout() {
	const navigation = useNavigation();
	return (
		<IconButton
			color="white"
			icon="logout"
			onPress={() => {
				firebase.auth().signOut().then(() => {
					navigation.navigate("Welcome");
				}).catch((error) => {
					console.log(error)
				});
			}}
		/>
	)
}