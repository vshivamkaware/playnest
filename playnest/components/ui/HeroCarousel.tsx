import React, { useRef, useState } from 'react';
import { View, Text, FlatList, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Info } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export interface HeroVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  categories: string[];
}

interface HeroCarouselProps {
  data: HeroVideo[];
  onPlay: (id: string) => void;
  onInfo: (id: string) => void;
}

export function HeroCarousel({ data, onPlay, onInfo }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const renderItem = ({ item }: { item: HeroVideo }) => {
    return (
      <View style={{ width, height: width * 1.2 }}>
        <Image
          source={item.thumbnailUrl}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={500}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)', '#09090b']}
          style={{ position: 'absolute', bottom: 0, width: '100%', height: '60%' }}
          locations={[0, 0.7, 1]}
        />
        <View className="absolute bottom-10 left-0 right-0 px-6 items-center">
          <View className="flex-row mb-3 flex-wrap justify-center gap-2">
            {item.categories.map((cat, i) => (
              <React.Fragment key={cat}>
                <Text className="text-zinc-300 text-xs font-semibold tracking-wider uppercase">{cat}</Text>
                {i < item.categories.length - 1 && (
                  <View className="w-1 h-1 rounded-full bg-zinc-500 self-center" />
                )}
              </React.Fragment>
            ))}
          </View>
          <Text className="text-white text-3xl font-bold text-center mb-6 tracking-tight">
            {item.title}
          </Text>
          <View className="flex-row gap-4 w-full px-4">
            <TouchableOpacity 
              className="flex-1 bg-white rounded-xl flex-row justify-center items-center py-3"
              onPress={() => onPlay(item.id)}
            >
              <Play fill="#09090b" color="#09090b" size={20} />
              <Text className="text-zinc-950 font-bold ml-2 text-base">Play</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex-1 bg-zinc-800/80 rounded-xl flex-row justify-center items-center py-3"
              onPress={() => onInfo(item.id)}
            >
              <Info color="white" size={20} />
              <Text className="text-white font-bold ml-2 text-base">Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
      />
      <View className="flex-row justify-center mt-3 gap-2 absolute bottom-2 w-full">
        {data.map((_, i) => (
          <View 
            key={i} 
            className={`h-1.5 rounded-full ${i === activeIndex ? 'w-4 bg-white' : 'w-1.5 bg-zinc-600'}`} 
          />
        ))}
      </View>
    </View>
  );
}
