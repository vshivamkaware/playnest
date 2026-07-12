import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { ChevronRight } from 'lucide-react-native';
import { useColorScheme } from 'react-native';

export interface VideoItem {
  id: string;
  title: string;
  thumbnailUrl: string;
}

interface HorizontalVideoListProps {
  title: string;
  data: VideoItem[];
  onPress: (id: string) => void;
  onSeeAll?: () => void;
}

export function HorizontalVideoList({ title, data, onPress, onSeeAll }: HorizontalVideoListProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const renderItem = ({ item }: { item: VideoItem }) => (
    <TouchableOpacity 
      className="mr-4 w-36"
      activeOpacity={0.7}
      onPress={() => onPress(item.id)}
    >
      <View className={`w-36 h-52 rounded-xl overflow-hidden mb-2 ${isDark ? 'bg-zinc-800' : 'bg-gray-200'}`}>
        <Image
          source={item.thumbnailUrl}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={300}
        />
      </View>
      <Text 
        className={`text-sm font-semibold tracking-tight ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`} 
        numberOfLines={2}
      >
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="mb-8">
      <View className="flex-row justify-between items-center px-4 mb-3">
        <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          {title}
        </Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll} className="flex-row items-center">
            <Text className="text-indigo-500 font-semibold text-sm mr-1">See All</Text>
            <ChevronRight color="#6366f1" size={16} />
          </TouchableOpacity>
        )}
      </View>
      
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />
    </View>
  );
}
