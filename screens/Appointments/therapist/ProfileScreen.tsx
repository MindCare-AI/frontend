import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Card, Title, Paragraph, Chip, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SLIMEN_ABYADH } from '../../../data/tunisianMockData';

const ProfileScreen: React.FC = () => {
  const therapistData = SLIMEN_ABYADH;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Header Section */}
          <Card style={styles.headerCard}>
            <View style={styles.headerContent}>
              <Image source={{ uri: therapistData.profile_pic }} style={styles.avatar} />
              <View style={styles.headerText}>
                <Title style={styles.name}>{therapistData.full_name}</Title>
                <Paragraph style={styles.specialization}>
                  {therapistData.specializations.slice(0, 2).join(' • ')}
                </Paragraph>
                <View style={styles.ratingContainer}>
                  <Text style={styles.rating}>⭐ {therapistData.rating}</Text>
                  <Text style={styles.ratingCount}>({therapistData.total_ratings} reviews)</Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Contact Information */}
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Contact Information</Title>
              <Divider style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{therapistData.email}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Phone:</Text>
                <Text style={styles.value}>{therapistData.phone_number}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Experience:</Text>
                <Text style={styles.value}>{therapistData.years_of_experience} years</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Hourly Rate:</Text>
                <Text style={styles.value}>{therapistData.hourly_rate} TND</Text>
              </View>
            </Card.Content>
          </Card>

          {/* Bio Section */}
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>About</Title>
              <Divider style={styles.divider} />
              <Paragraph style={styles.bio}>{therapistData.bio}</Paragraph>
            </Card.Content>
          </Card>

          {/* Specializations */}
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Specializations</Title>
              <Divider style={styles.divider} />
              <View style={styles.chipContainer}>
                {therapistData.specializations.map((spec, index) => (
                  <Chip key={index} style={styles.chip} textStyle={styles.chipText}>
                    {spec}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>

          {/* Treatment Approaches */}
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Treatment Approaches</Title>
              <Divider style={styles.divider} />
              <View style={styles.chipContainer}>
                {therapistData.treatment_approaches.map((approach, index) => (
                  <Chip key={index} style={styles.treatmentChip} textStyle={styles.chipText}>
                    {approach}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>

          {/* Languages */}
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Languages</Title>
              <Divider style={styles.divider} />
              <Text style={styles.languages}>{therapistData.languages.join(' • ')}</Text>
            </Card.Content>
          </Card>

          {/* Education */}
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Education</Title>
              <Divider style={styles.divider} />
              {therapistData.education.map((edu, index) => (
                <View key={index} style={styles.educationItem}>
                  <Text style={styles.degree}>{edu.degree}</Text>
                  <Text style={styles.institution}>{edu.institution}</Text>
                  <Text style={styles.year}>{edu.year}</Text>
                </View>
              ))}
            </Card.Content>
          </Card>

          {/* Statistics */}
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Professional Statistics</Title>
              <Divider style={styles.divider} />
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{therapistData.total_sessions.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>Total Sessions</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{therapistData.total_ratings}</Text>
                  <Text style={styles.statLabel}>Reviews</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{therapistData.rating}/5</Text>
                  <Text style={styles.statLabel}>Rating</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  headerCard: {
    marginBottom: 16,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 4,
  },
  specialization: {
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF8C00',
    marginRight: 8,
  },
  ratingCount: {
    color: '#666',
    fontSize: 14,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 8,
  },
  divider: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#E8F4FD',
    marginBottom: 8,
  },
  treatmentChip: {
    backgroundColor: '#E8F8F5',
    marginBottom: 8,
  },
  chipText: {
    color: '#003366',
    fontSize: 12,
  },
  languages: {
    fontSize: 14,
    color: '#333',
  },
  educationItem: {
    marginBottom: 12,
  },
  degree: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#003366',
  },
  institution: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  year: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#003366',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default ProfileScreen;