import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, TextInput, List, Divider, ActivityIndicator, Card, IconButton } from 'react-native-paper';
import { AppSettings } from '../../API/settings/settings';
import { globalStyles } from '../../styles/global';
import { TIMEZONES } from '../../utils/timezones';

interface TimeZoneSettingsProps {
  initialData: AppSettings;
  onUpdate: (settings: Partial<AppSettings>) => void;
  loading?: boolean;
}

export const TimeZoneSettings: React.FC<TimeZoneSettingsProps> = ({ 
  initialData, 
  onUpdate, 
  loading = false 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTimezones, setFilteredTimezones] = useState(TIMEZONES);
  const [showList, setShowList] = useState(false);
  
  const currentTimezone = initialData.timezone || 'UTC';

  const filterTimezones = useCallback((query: string) => {
    if (!query.trim()) {
      return TIMEZONES;
    }
    
    const normalizedQuery = query.toLowerCase();
    return TIMEZONES.filter(timezone => 
      timezone.toLowerCase().includes(normalizedQuery)
    );
  }, []);

  useEffect(() => {
    setFilteredTimezones(filterTimezones(searchQuery));
  }, [searchQuery, filterTimezones]);

  const handleSelectTimezone = (timezone: string) => {
    onUpdate({ timezone });
    setShowList(false);
    setSearchQuery('');
  };

  return (
    <Card style={styles.container} elevation={1}>
      <Card.Title 
        title="Timezone Settings" 
        titleStyle={styles.cardTitle}
        titleVariant="titleLarge"
        right={() => loading && <ActivityIndicator size={20} color={globalStyles.colors.primary} style={styles.loader} />}
      />
      <Card.Content>
        <View style={styles.inputContainer}>
          <TextInput
            label="Search timezone"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setShowList(true)}
            right={
              <TextInput.Icon 
                icon={searchQuery ? "close" : "magnify"} 
                onPress={() => searchQuery ? setSearchQuery('') : null}
                color={globalStyles.colors.textSecondary}
              />
            }
            style={styles.input}
            mode="outlined"
            outlineStyle={{ borderColor: globalStyles.colors.border }}
            activeOutlineColor={globalStyles.colors.primary}
            textColor={globalStyles.colors.text}
          />
          
          <View style={styles.currentTimezoneContainer}>
            <IconButton 
              icon="clock-outline" 
              size={16}
              // Fixed: Remove the color prop that's causing the type error
              // and use iconColor instead which is the correct prop for react-native-paper
              iconColor={globalStyles.colors.textSecondary}
            />
            <Text style={styles.currentTimezone}>
              Current timezone: <Text style={styles.highlightedText}>{currentTimezone}</Text>
            </Text>
          </View>
        </View>
      </Card.Content>
      
      {showList && (
        <View style={styles.listContainer}>
          {filteredTimezones.length > 0 ? (
            <FlatList
              data={filteredTimezones}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <List.Item
                  title={item}
                  onPress={() => handleSelectTimezone(item)}
                  style={item === currentTimezone ? styles.selectedItem : styles.listItem}
                  titleStyle={item === currentTimezone ? styles.selectedItemText : { color: globalStyles.colors.text }}
                  left={item === currentTimezone ? 
                    props => <List.Icon {...props} icon="check" color={globalStyles.colors.primary} /> : 
                    props => <List.Icon {...props} icon="clock-outline" color="transparent" />
                  }
                />
              )}
              ItemSeparatorComponent={() => <Divider />}
              style={styles.list}
              initialNumToRender={15}
              maxToRenderPerBatch={20}
              windowSize={10}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No matching timezones found</Text>
            </View>
          )}
          <View style={styles.closeButtonContainer}>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setShowList(false)}
              style={styles.closeButton}
            />
          </View>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: globalStyles.colors.white,
    borderColor: globalStyles.colors.border,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: globalStyles.colors.text,
  },
  loader: {
    marginRight: 16,
  },
  inputContainer: {
    marginBottom: 8,
  },
  input: {
    backgroundColor: globalStyles.colors.white,
    color: globalStyles.colors.text,
  },
  currentTimezoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 4,
  },
  currentTimezone: {
    fontSize: 14,
    color: globalStyles.colors.textSecondary,
  },
  highlightedText: {
    color: globalStyles.colors.primary,
    fontWeight: 'bold',
  },
  listContainer: {
    maxHeight: 300,
    borderTopWidth: 1,
    borderTopColor: globalStyles.colors.border,
    position: 'relative',
    backgroundColor: globalStyles.colors.white,
  },
  list: {
    backgroundColor: globalStyles.colors.white,
  },
  listItem: {
    paddingLeft: 8,
  },
  selectedItem: {
    backgroundColor: `${globalStyles.colors.primary}20`,
    paddingLeft: 8,
  },
  selectedItemText: {
    fontWeight: 'bold',
    color: globalStyles.colors.primary,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: globalStyles.colors.white,
  },
  emptyText: {
    color: globalStyles.colors.textSecondary,
    fontStyle: 'italic',
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  closeButton: {
    backgroundColor: `${globalStyles.colors.primaryLight}40`,
  }
});