import {
  View,
  Text,
  Image,
  ScrollView,
  Touchable,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { router, useLocalSearchParams } from "expo-router";
import useFetch from "@/services/useFetch";
import { fetchMovieDetails } from "@/services/api";
import { icons } from "@/constants/icons";
import { deleteSavedMovie, getIsSavedMovie, saveMovie } from "@/services/appwrite";

interface MovieInfoProps {
  label: string | null;
  value: string | null;
}

const MovieInfo = ({ label, value }: MovieInfoProps) => (
  <View className="flex-col items-start justify-center mt-5">
    <Text className="text-light-200 text-sm font-normal">{label}</Text>
    <Text className="text-light-200 text-sm font-bold mt-2">
      {value || "N/A"}
    </Text>
  </View>
);


const MovieDetails = () => {
  const { id } = useLocalSearchParams();
  const { data: movie, loading } = useFetch(() =>
    fetchMovieDetails(id as string)
  );
  const [isSaved, setIsSaved] = React.useState(false);
  
  React.useEffect(() => {
    const fetchSavedState = async () => {
      try {
        const saved = await getIsSavedMovie(id as unknown as number);
        setIsSaved(saved);
      } catch (error) {
        console.error("Failed to fetch saved state:", error);
      }
    };
  
    fetchSavedState();
  }, [id]);

  const handleSave = async (movie: any) => {
    try {
      await saveMovie({
        movie_id: movie?.id,
        title: movie?.title,
        poster_path: movie?.poster_path,
        release_date: movie?.release_date,
        vote_average: movie?.vote_average,
        original_language: movie?.original_language,
      });
      setIsSaved(true);
    } catch (error) {
      console.error("Failed to save movie:", error);
    }
  };

  const handleUnsave = async (movieId: number | undefined) => {
    try {
      await deleteSavedMovie(movieId as number);
      setIsSaved(false);
    } catch (error) {
      console.error("Failed to unsave movie:", error);
    }
  };

  return (
    <View className="bg-primary flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View>
          <Image
            source={{
              uri: `https://image.tmdb.org/t/p/w500${movie?.poster_path}`,
            }}
            className="w-full h-[550px]"
            resizeMode="stretch"
          />
        </View>
        <View className="flex-col items-start justiify-center mt-5 px-5">
          <Text className="text-white text-xl font-bold">{movie?.title}</Text>
          <View className="flex-row items-center gap-1 mt-2">
            <Text className="text-light-200 text-sm ">
              {movie?.release_date?.split("-")[0]}
            </Text>
            <Text className="text-light-200 text-sm ">{movie?.runtime}m</Text>
          </View>
          <View className="flex-row items-center justify-between mt-2">
            <View className="flex-row items-center bg-dark-100 px-3 py-2 rounded-md gap-x-2 flex-1">
              <Image source={icons.star} className="size-4" />
              <View className="flex-1">
              <Text className="text-white font-bold text-sm">
                {movie?.vote_average ?? 0}/10
              </Text>
              <Text className="text-light-200 text-sm">
                {movie?.vote_count} votes
              </Text>
              </View>
            </View>
            <TouchableOpacity
              className="px-2 py-1 rounded-md"
              onPress={async () => {
                if (isSaved) {
                  await handleUnsave(movie?.id);
                } else {
                  await handleSave(movie);
                }
              }}
            >
              <Image
                source={isSaved ? icons.star : icons.save} // Icône dynamique
                className="size-4 ml-[180px]"
                tintColor="#fff"
              />
            </TouchableOpacity>
          </View>
          <MovieInfo label="Overview" value={movie?.overview} />
          <MovieInfo
            label="Genres"
            value={movie?.genres?.map((g) => g.name)?.join(" - ") || "N/A"}
          />
          <View className="flex flew-row justify-between w-1/2">
            <MovieInfo
              label="Budget"
              value={`$${movie?.budget / 1_0000_000} millions`}
            />
            <MovieInfo
              label="Revenue"
              value={`$${Math.round(movie?.revenue / 1_0000_000)} millions`}
            />
          </View>
          <MovieInfo
            label="Production Companies"
            value={
              movie?.production_companies?.map((c) => c.name)?.join(" - ") ||
              "N/A"
            }
          />
        </View>
      </ScrollView>
      <TouchableOpacity
        className="absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50"
        onPress={router.back}
      >
        <Image
          source={icons.arrow}
          className="size-5 mr-1 mt-0.5 rotate-180"
          tintColor="#fff"
        />
        <Text className="text-white text-base font-semibold">Go back</Text>
      </TouchableOpacity>
    </View>
  );
};
export default MovieDetails;
