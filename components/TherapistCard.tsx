import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';

interface TherapistCardProps {
  therapist: {
    id: string;
    name: string;
    specialty: string;
    rating: number;
    image: string;
  };
  isSelected: boolean;
  onSelect: () => void;
}

const TherapistCard: React.FC<TherapistCardProps> = ({
  therapist,
  isSelected,
  onSelect
}) => {
  return (
    <TouchableOpacity
      onPress={onSelect}
      style={[
        styles.container,
        isSelected ? styles.selectedContainer : styles.unselectedContainer
      ]}
    >
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: therapist.image }}
            style={styles.image}
          />
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={[
            styles.name,
            isSelected && styles.selectedText
          ]}>
            {therapist.name}
          </Text>
          
          <Text style={[
            styles.specialty,
            isSelected && styles.selectedSpecialty
          ]}>
            {therapist.specialty}
          </Text>
          
          <View style={styles.ratingContainer}>
            <Star 
              size={14} 
              color={isSelected ? "#FCD34D" : "#F59E0B"} 
              fill="currentColor" 
            />
            <Text style={[
              styles.rating,
              isSelected && styles.selectedText
            ]}>
              {therapist.rating}
            </Text>
          </View>
        </View>
        
        <View style={[
          styles.checkmark,
          isSelected ? styles.selectedCheckmark : styles.unselectedCheckmark
        ]}>
          {isSelected && (
            <View style={styles.checkIcon} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  selectedContainer: {
    backgroundColor: 'black',
  },
  unselectedContainer: {
    backgroundColor: '#F3F4F6',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'white',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
  },
  specialty: {
    fontSize: 14,
    color: '#6B7280',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    color: '#111827',
  },
  selectedText: {
    color: 'white',
  },
  selectedSpecialty: {
    color: '#E5E7EB',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCheckmark: {
    backgroundColor: 'white',
  },
  unselectedCheckmark: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  checkIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'black',
  },
});

export default TherapistCard;