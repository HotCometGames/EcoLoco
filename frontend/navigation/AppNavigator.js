import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'

import HomeScreen from '../screens/HomeScreen'
import IdentificationScreen from '../screens/IdentificationScreen'
import RecommendationScreen from '../screens/RecommendationScreen'

const DARK_GREEN = '#1e3a1e';
const Tab = createBottomTabNavigator()

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,

          tabBarStyle: {
            backgroundColor: DARK_GREEN, // green bottom bar
            borderTopWidth: 0,
            height: 65,
            paddingBottom: 8,
            paddingTop: 8,
          },

          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#d9f2d9',

          tabBarIcon: ({ color, size }) => {
            let iconName

            if (route.name === 'Home') {
              iconName = 'home'
            } else if (route.name === 'Identification') {
              iconName = 'leaf'
            } else if (route.name === 'Recommend') {
              iconName = 'thumbs-up'
            }

            return (
              <Ionicons
                name={iconName}
                size={size}
                color={color}
              />
            )
          },
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
        />
        <Tab.Screen
          name="Identification"
          component={IdentificationScreen}
        />
        <Tab.Screen
          name="Recommend"
          component={RecommendationScreen}
        />
      </Tab.Navigator>
    </NavigationContainer>
  )
}