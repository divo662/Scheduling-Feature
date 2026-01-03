import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

const TABS = [
  'Availability',
  'Booking',
  'Confirmation',
  'Reschedule',
  'Empty State'
];

const NavigationTabs = ({ activeTab, onTabPress }) => {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.tabActive
            ]}
            onPress={() => onTabPress?.(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive
              ]}
              numberOfLines={1}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    maxHeight: 50,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    flexDirection: 'row',
    paddingHorizontal: 4,
    minWidth: '100%',
  },
  tab: {
    minWidth: 80,
    paddingVertical: 12,
    paddingHorizontal: isSmallScreen ? 6 : 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#7B2CBF',
  },
  tabText: {
    fontSize: isSmallScreen ? 10 : 12,
    color: '#999',
    fontWeight: '500',
    fontFamily: 'Inter, sans-serif',
  },
  tabTextActive: {
    color: '#7B2CBF',
    fontWeight: '600',
  },
});

export default NavigationTabs;
