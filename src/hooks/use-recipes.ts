
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Recipe } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useAuth } from './use-auth';

export function useRecipes() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      if (!user) {
        setRecipes([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const q = query(collection(db, 'recipes'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const userRecipes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe));
        setRecipes(userRecipes);
      } catch (error) {
        console.error('Failed to load recipes from Firestore', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, [user]);

  const addRecipe = useCallback(async (newRecipeData: Omit<Recipe, 'id'>) => {
    if (!user) {
      console.error('No user logged in to add recipe');
      return;
    }
    try {
      const docRef = await addDoc(collection(db, 'recipes'), newRecipeData);
      setRecipes(prev => [...prev, { ...newRecipeData, id: docRef.id }]);
    } catch (error) {
      console.error('Failed to save recipe to Firestore', error);
    }
  }, [user]);

  const getRecipeById = useCallback(async (id: string): Promise<Recipe | undefined> => {
    // First, check if the recipe is already in the local state
    const localRecipe = recipes.find(recipe => recipe.id === id);
    if (localRecipe) {
      return localRecipe;
    }

    // If not, fetch from Firestore
    setIsLoading(true);
    try {
      const docRef = doc(db, 'recipes', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const recipeData = { id: docSnap.id, ...docSnap.data() } as Recipe;
        // Optional: check if the user is authorized to view this recipe
        if (user && recipeData.userId === user.uid) {
          return recipeData;
        }
      }
      return undefined;
    } catch (error) {
      console.error('Failed to fetch recipe from Firestore', error);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, [recipes, user]);

  return { recipes, addRecipe, getRecipeById, isLoading };
}
