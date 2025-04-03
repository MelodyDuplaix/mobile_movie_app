import {View, Text, Image, ScrollView, ActivityIndicator, FlatList} from "react-native";
import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { getSavedMovies } from "@/services/appwrite";
import useFetch from "@/services/useFetch";
import { images } from "@/constants/images";
import MovieCard from "@/components/MovieCard";

export default function Saved() {
    const {
        data: savedMovies,
        loading: savedLoading,
        error: savedError,
        refetch,
    } = useFetch(getSavedMovies);

    const [isFirstLoad, setIsFirstLoad] = useState(true);

    useFocusEffect(
        useCallback(() => {
            refetch().finally(() => setIsFirstLoad(false));
        }, [refetch])
    );

    return (
        <View className="bg-primary flex-1">
            <Image source={images.bg} className="absolute w-full z-0" resizeMode="cover" />
            <ScrollView
                className="flex-1 px-5"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    minHeight: "100%",
                    paddingBottom: 10,
                }}
            >
                {isFirstLoad && savedLoading ? (
                    <ActivityIndicator size="large" color="#0000ff" className="mt-10 self-center" />
                ) : savedError ? (
                    <Text>Error: {savedError?.message}</Text>
                ) : (
                    <View className="flex-1 mt-5">
                        {savedMovies && savedMovies.length > 0 && (
                            <View className="mt-10">
                                <Text className="text-lg text-white font-bold mb-3">Saved Movies</Text>
                            </View>
                        )}
                        <FlatList
                            data={savedMovies}
                            renderItem={({ item }) => <MovieCard {...item} />}
                            keyExtractor={(item) => item.id.toString()}
                            numColumns={3}
                            columnWrapperStyle={{
                                justifyContent: "flex-start",
                                gap: 20,
                                paddingRight: 5,
                                marginBottom: 10,
                            }}
                            className="mt-2 pb-32"
                            scrollEnabled={false}
                        />
                    </View>
                )}
            </ScrollView>
        </View>
    );
}