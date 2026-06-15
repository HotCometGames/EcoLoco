import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import HomeScreen from '../screens/HomeScreen'
import IdentificationScreen from '../screens/IdentificationScreen'
import RecommendationScreen from '../screens/RecommendationScreen'

const Tab = createBottomTabNavigator()

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        {<Tab.Screen name="Home" component={HomeScreen} />}
        {<Tab.Screen name="Camera" component={IdentificationScreen} />}
        {<Tab.Screen name="Recommend" component={RecommendationScreen} />}
      </Tab.Navigator>
    </NavigationContainer>
  )
}