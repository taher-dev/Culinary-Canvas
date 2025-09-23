
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRecipes } from '@/hooks/use-recipes';
import RecipeCard from '@/components/RecipeCard';
import { LayoutGrid, List, PlusCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import RecipeListItem from './RecipeListItem';
import { useAuth } from '@/hooks/use-auth';

export default function Home() {
  const { user } = useAuth();
  const { recipes, isLoading, isDeleting, deleteRecipe } = useRecipes();
  const [view, setView] = useState<'card' | 'list'>('card');

  const toggleView = () => {
    setView(prev => (prev === 'card' ? 'list' : 'card'));
  };

  if (!user && !isLoading) {
    return (
      <div className="container mx-auto px-2 py-8 sm:px-6 text-center">
        <h1 className="text-3xl font-bold font-headline text-foreground">Welcome to Culinary Canvas</h1>
        <p className="text-muted-foreground mt-2 mb-6">Please log in to manage your personal collection of culinary creations.</p>
        <Button asChild>
            <Link href="/login">Login</Link>
        </Button>
      </div>
    )
  }
  
  if (isDeleting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Deleting recipe...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 py-8 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">My Cooking History</h1>
          <p className="text-muted-foreground mt-1">Your personal collection of culinary creations.</p>
        </div>
        <div className="flex w-full sm:w-auto items-center justify-between sm:justify-start sm:gap-2">
            <Link href="/add" passHref>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Recipe
                </Button>
            </Link>
            <Button
                variant={'outline'}
                size="icon"
                onClick={toggleView}
                aria-label="Toggle View"
            >
                {view === 'card' ? <List className="h-5 w-5 transition-transform duration-300 transform" /> : <LayoutGrid className="h-5 w-5 transition-transform duration-300 transform" />}
            </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card p-4 rounded-lg shadow-sm animate-pulse">
              <div className="aspect-[4/3] w-full bg-muted rounded-md mb-4"></div>
              <div className="h-6 w-3/4 bg-muted rounded-md mb-2"></div>
              <div className="h-4 w-1/2 bg-muted rounded-md"></div>
            </div>
          ))}
        </div>
      ) : recipes.length > 0 ? (
        view === 'card' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} onDelete={deleteRecipe} />
            ))}
            </div>
        ) : (
            <div className="space-y-4">
                {recipes.map(recipe => (
                    <RecipeListItem key={recipe.id} recipe={recipe} onDelete={deleteRecipe}/>
                ))}
            </div>
        )
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold text-foreground">No Recipes Yet!</h2>
          <p className="text-muted-foreground mt-2 mb-4">
            Start building your digital cookbook by adding your first recipe.
          </p>
          <Link href="/add" passHref>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Your First Recipe
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
