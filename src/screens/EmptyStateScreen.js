import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import NavigationTabs from '../components/NavigationTabs';
import { CalendarIcon, CloseIcon, BellIcon } from '../components/Icons';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

const EmptyStateScreen = ({ 
  message = 'This mentor doesn\'t have any available time slots at the moment. Check back later or set up a notification.',
  onRetry,
  showRetry = false,
  mentorName = 'Dr. Sarah Chen',
  activeTab,
  onTabPress
}) => {
  return (
    <View style={styles.container}>
      <NavigationTabs activeTab={activeTab} onTabPress={onTabPress} />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.mentorSection}>
            <View style={styles.avatar} />
            <View style={styles.mentorInfo}>
              <Text style={styles.mentorName}>{mentorName}</Text>
              <Text style={styles.mentorRole}>Computer Science</Text>
            </View>
          </View>

          <View style={styles.emptyStateContent}>
            <View style={styles.emptyIconContainer}>
              <View style={styles.emptyIconCircle}>
                <CalendarIcon size={48} color="#999" />
                <View style={styles.emptyIconX}>
                  <CloseIcon size={16} color="#999" />
                </View>
              </View>
            </View>

            <Text style={styles.emptyTitle}>No Available Slots</Text>
            <Text style={styles.emptyMessage}>{message}</Text>

            <TouchableOpacity style={styles.notifyButton}>
              <BellIcon size={18} color="#fff" style={styles.bellIconStyle} />
              <Text style={styles.notifyButtonText}>Notify Me When Available</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.viewOtherButton}>
              <Text style={styles.viewOtherButtonText}>View Other Mentors</Text>
            </TouchableOpacity>

            <View style={styles.suggestionsCard}>
              <Text style={styles.suggestionsTitle}>What you can do:</Text>
              <View style={styles.suggestionItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.suggestionText}>
                  Enable notifications to get alerted when slots open
                </Text>
              </View>
              <View style={styles.suggestionItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.suggestionText}>
                  Browse other mentors in Computer Science
                </Text>
              </View>
              <View style={styles.suggestionItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.suggestionText}>
                  Check this mentor's availability next week
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  mentorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    marginRight: 12,
  },
  mentorInfo: {
    flex: 1,
  },
  mentorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  mentorRole: {
    fontSize: 14,
    color: '#666',
  },
  emptyStateContent: {
    alignItems: 'center',
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  emptyIconX: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  notifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7B2CBF',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    justifyContent: 'center',
    marginBottom: 12,
  },
  bellIconStyle: {
    marginRight: 8,
  },
  notifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  viewOtherButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 32,
  },
  viewOtherButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  suggestionsCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    marginBottom: 32,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
    marginTop: 2,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default EmptyStateScreen;
