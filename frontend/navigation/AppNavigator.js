import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import HomeScreen from '../screens/HomeScreen'
//import CameraScreen from '../screens/CameraScreen'
//import RecommendationScreen from '../screens/RecommendationScreen'

const Tab = createBottomTabNavigator()

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        {<Tab.Screen name="Home" component={HomeScreen} />}
        {/* <Tab.Screen name="Camera" component={CameraScreen} /> */}
        {/* <Tab.Screen name="Recommend" component={RecommendationScreen} /> */}
      </Tab.Navigator>
    </NavigationContainer>
  )
}