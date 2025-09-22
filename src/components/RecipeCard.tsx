
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Utensils, Trash2 } from 'lucide-react';
import type { Recipe } from '@/lib/types';
import { Button } from './ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRecipes } from '@/hooks/use-recipes';
import { useState } from 'react';

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const { deleteRecipe } = useRecipes();
  const [isHovering, setIsHovering] = useState(false);

  const confirmDelete = async () => {
    await deleteRecipe(recipe.id);
  };

  return (
    <Card 
      className="h-full overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl group relative"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            size="icon"
            className={`absolute top-2 right-2 z-10 h-8 w-8 transition-opacity ${isHovering ? 'opacity-100' : 'opacity-0'}`}
            aria-label="Delete recipe"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the recipe
              for "{recipe.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Yes, delete it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Link href={`/recipe/${recipe.id}`} className="block">
        <CardHeader className="p-0">
          <div className="aspect-[4/3] relative w-full overflow-hidden">
            <Image
              src={recipe.image || "https://picsum.photos/seed/1/400/300"}
              alt={recipe.title}
              fill
              className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <Badge variant="secondary" className="mb-2">{recipe.category}</Badge>
          <CardTitle className="text-lg font-headline font-semibold leading-tight mb-2 truncate group-hover:text-primary">
            {recipe.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground mb-3 h-10 line-clamp-2">
            {recipe.description}
          </p>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{recipe.time}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>Serves {recipe.servingSize}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Utensils className="h-4 w-4" />
                <span>{recipe.ingredients.length} ingredients</span>
              </div>
            </div>
        </CardContent>
      </Link>
    </Card>
  );
}
