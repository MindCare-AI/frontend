import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import JournalScreen from '../screens/JournalScreen/JournalScreen';
import JournalCreateScreen from '../screens/JournalScreen/JournalCreateScreen';
import JournalDetailScreen from '../screens/JournalScreen/JournalDetailScreen';
import JournalEditScreen from '../screens/JournalScreen/JournalEditScreen';
import JournalStatisticsScreen from '../screens/JournalScreen/JournalStatisticsScreen';
import { JournalEntry } from '../types/journal';

export type JournalStackParamList = {
  JournalMain: undefined;
  JournalCreate: undefined;
  JournalDetail: { journalId: number };
  JournalEdit: { entry: JournalEntry };
  JournalStatistics: undefined;
};

const Stack = createStackNavigator<JournalStackParamList>();

const JournalNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="JournalMain"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1976d2',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="JournalMain"
        component={JournalScreen}
        options={{ title: 'My Journal' }}
      />
      <Stack.Screen
        name="JournalCreate"
        component={JournalCreateScreen}
        options={{ title: 'New Journal Entry' }}
      />
      <Stack.Screen
        name="JournalDetail"
        component={JournalDetailScreen}
        options={{ title: 'Journal Details' }}
      />
      <Stack.Screen
        name="JournalEdit"
        component={JournalEditScreen}
        options={{ title: 'Edit Journal Entry' }}
      />
      <Stack.Screen
        name="JournalStatistics"
        component={JournalStatisticsScreen}
        options={{ title: 'Journal Statistics' }}
      />
    </Stack.Navigator>
  );
};

export default JournalNavigator;