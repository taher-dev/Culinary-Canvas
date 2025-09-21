'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Recipe } from '@/lib/types';

const RECIPES_KEY = 'culinary-canvas-recipes';

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(RECIPES_KEY);
      if (item) {
        setRecipes(JSON.parse(item));
      }
    } catch (error) {
      console.error('Failed to load recipes from localStorage', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addRecipe = useCallback((newRecipe: Recipe) => {
    try {
      const updatedRecipes = [...recipes, newRecipe];
      setRecipes(updatedRecipes);
      window.localStorage.setItem(RECIPES_KEY, JSON.stringify(updatedRecipes));
    } catch (error) {
      console.error('Failed to save recipe to localStorage', error);
    }
  }, [recipes]);

  const getRecipeById = useCallback((id: string): Recipe | undefined => {
    return recipes.find(recipe => recipe.id === id);
  }, [recipes]);

  return { recipes, addRecipe, getRecipeById, isLoading };
}
