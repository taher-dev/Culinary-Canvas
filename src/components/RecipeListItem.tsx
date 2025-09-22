
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
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

interface RecipeListItemProps {
  recipe: Recipe;
}

export default function RecipeListItem({ recipe }: RecipeListItemProps) {
  const { deleteRecipe } = useRecipes();
  
  const confirmDelete = async () => {
    await deleteRecipe(recipe.id);
  };

  return (
    <div className="group relative">
      <Link href={`/recipe/${recipe.id}`} className="block">
        <Card className="transition-all duration-300 ease-in-out group-hover:shadow-lg group-hover:border-primary overflow-hidden">
          <div className="flex items-stretch">
              <div className="relative w-32 flex-shrink-0">
                  <Image
                  src={recipe.image || "https://picsum.photos/seed/1/128/180"}
                  alt={recipe.title}
                  fill
                  className="object-cover"
                  />
              </div>
              <div className="p-4 flex-1">
                  <Badge variant="secondary" className="mb-1">{recipe.category}</Badge>
                  <h3 className="text-lg font-headline font-semibold leading-tight mb-1 group-hover:text-primary truncate">
                  {recipe.title}
                  </h3>
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
              </div>
          </div>
        </Card>
      </Link>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 z-10 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Delete recipe"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
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
            <AlertDialogAction onClick={confirmDelete}>
              Yes, delete it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
