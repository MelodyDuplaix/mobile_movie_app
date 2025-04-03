import { Client, Databases, ID, Query } from "react-native-appwrite";
// track the searches made by the user

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;
const SAVEDCOLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_SAVED_COLLECTION_ID!;

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const database = new Databases(client);

export const updateSearchCount = async (query: string, movie: Movie) => {

    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.equal('searchTerm', query),
        ]);
    
        if (result.documents.length > 0) {
            const existingMovie = result.documents[0];
    
            await database.updateDocument(DATABASE_ID, COLLECTION_ID, existingMovie.$id, {
                count: existingMovie.count + 1
            });
        } else {
            await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                searchTerm: query,
                movie_id: movie.id,
                count: 1,
                title: movie.title,
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            });
        }
    } catch (error) {
        console.error("Error in updateSearchCount:", error);
        throw error;
    }
};

export const getTrendingMovies = async (): Promise<TrendingMovie[] | undefined> => {
    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.limit(5),
            Query.orderDesc('count'),
        ])

        return result.documents as unknown as TrendingMovie[];
    } catch (error) {
        console.error("Error in getTrendingMovies:", error);
        throw error;
    }
};


export const getSavedMovies = async (): Promise<SavedMovie[] | undefined> => {
    try {
        const result = await database.listDocuments(DATABASE_ID, SAVEDCOLLECTION_ID, [
            Query.limit(5),
        ])

        return result.documents as unknown as SavedMovie[];
    } catch (error) {
        console.error("Error in getSavedMovies:", error);
        throw error;
    }
};

export const saveMovie = async (movie: SavedMovie) => {
    try {
        await database.createDocument(DATABASE_ID, SAVEDCOLLECTION_ID, ID.unique(), movie);
    } catch (error) {
        console.error("Error in saveMovie:", error);
        throw error;
    }
};

export const getIsSavedMovie = async (movie_id: number): Promise<boolean> => {
    try {
        const movieIdAsNumber = Number(movie_id);
        if (isNaN(movieIdAsNumber)) {
            throw new Error("Invalid movie_id: not a number");
        }

        const result = await database.listDocuments(DATABASE_ID, SAVEDCOLLECTION_ID, [
            Query.equal('movie_id', movieIdAsNumber),
        ]);

        return result.documents.length > 0;
    } catch (error) {
        console.error("Error in getIsSavedMovie:", error);
        throw error;
    }
};

export const deleteSavedMovie = async (movie_id: number) => {
    try {
        const movieIdAsNumber = Number(movie_id);
        if (isNaN(movieIdAsNumber)) {
            throw new Error("Invalid movie_id: not a number");
        }

        const result = await database.listDocuments(DATABASE_ID, SAVEDCOLLECTION_ID, [
            Query.equal('movie_id', movieIdAsNumber),    
        ]);
        if (result.documents.length > 0) {
            const documentId = result.documents[0].$id;
            await database.deleteDocument(DATABASE_ID, SAVEDCOLLECTION_ID, documentId);
        } else {
            throw new Error("Movie not found in the saved collection");
        }
    } catch (error) {
        console.error("Error in deleteSavedMovie:", error);
        throw error;    
    }
};