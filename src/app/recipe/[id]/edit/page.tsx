
'use client';

import { useParams } from 'next/navigation';
import { useRecipes } from '@/hooks/use-recipes';
import { useEffect, useState } from 'react';
import type { Recipe } from '@/lib/types';
import RecipeForm from '@/components/RecipeForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditRecipePage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const { getRecipeById } = useRecipes();
  const [recipe, setRecipe] = useState<Recipe | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchRecipe = async () => {
        setIsLoading(true);
        const fetchedRecipe = await getRecipeById(id);
        setRecipe(fetchedRecipe);
        setIsLoading(false);
      };
      fetchRecipe();
    }
  }, [id, getRecipeById]);

  return (
    <div className="container mx-auto max-w-3xl py-8 px-2 sm:px-6 md:px-8">
      <div className="mb-8 -ml-4">
        <Button variant="ghost" asChild>
          <Link href={id ? `/recipe/${id}` : '/'} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Recipe
          </Link>
        </Button>
      </div>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold font-headline text-foreground">Edit Recipe</h1>
        <p className="text-muted-foreground">
          Make changes to your culinary creation below.
        </p>
      </div>
      <div className="mt-8">
        {isLoading ? (
          <div className="space-y-8">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ) : recipe ? (
          <RecipeForm initialData={recipe} />
        ) : (
          <p>Recipe not found.</p>
        )}
      </div>
    </div>
  );
}
