import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Home Screen
import HomeScreen from '../screens/HomeScreen';

// Event Screens
import EventDetailsScreen from '../screens/events/EventDetailsScreen';

// Notifications Screens
import NotificationsScreen from '../screens/notifications/NotificationsScreen';

// Profile Screens
import ProfileScreen from '../screens/profile/ProfileScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f5fb' }}>
        <ActivityIndicator size="large" color="#365486" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            
            <Stack.Screen 
              name="EventDetails" 
              component={EventDetailsScreen}
              options={{
                headerShown: true,
                title: 'Detalles del Evento',
                headerStyle: {
                  backgroundColor: '#fff',
                },
                headerTintColor: '#365486',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            />
            
            <Stack.Screen 
              name="Notifications" 
              component={NotificationsScreen}
              options={{
                headerShown: true,
                title: 'Notificaciones',
                headerStyle: {
                  backgroundColor: '#fff',
                },
                headerTintColor: '#365486',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            />
            
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen}
              options={{
                headerShown: true,
                title: 'Mi Perfil',
                headerStyle: {
                  backgroundColor: '#fff',
                },
                headerTintColor: '#365486',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;