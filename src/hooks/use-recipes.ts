
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Recipe } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
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
      setRecipes(prev => [{ ...newRecipeData, id: docRef.id }, ...prev]);
    } catch (error) {
      console.error('Failed to save recipe to Firestore', error);
    }
  }, [user]);

  const getRecipeById = useCallback(async (id: string): Promise<Recipe | undefined> => {
    const localRecipe = recipes.find(recipe => recipe.id === id);
    if (localRecipe) {
      return localRecipe;
    }

    try {
      const docRef = doc(db, 'recipes', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const recipeData = { id: docSnap.id, ...docSnap.data() } as Recipe;
        if (user && recipeData.userId === user.uid) {
          return recipeData;
        }
      }
      return undefined;
    } catch (error) {
      console.error('Failed to fetch recipe from Firestore', error);
      return undefined;
    }
  }, [recipes, user]);

  const deleteRecipe = useCallback(async (recipeId: string) => {
    if (!user) {
      console.error('No user logged in to delete recipe');
      return;
    }
    try {
      await deleteDoc(doc(db, 'recipes', recipeId));
      setRecipes(prev => prev.filter(recipe => recipe.id !== recipeId));
    } catch (error) {
      console.error('Failed to delete recipe from Firestore', error);
    }
  }, [user]);

  return { recipes, addRecipe, getRecipeById, deleteRecipe, isLoading };
}
