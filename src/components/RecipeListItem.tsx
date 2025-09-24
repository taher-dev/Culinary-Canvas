
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Utensils, Trash2, MoreVertical, Pencil } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import placeholderData from '@/app/lib/placeholder-images.json';

interface RecipeListItemProps {
  recipe: Recipe;
  onDelete: (id: string) => Promise<void>;
}

export default function RecipeListItem({ recipe, onDelete }: RecipeListItemProps) {
  const confirmDelete = async () => {
    await onDelete(recipe.id);
  };

  const { "data-ai-hint": aiHint, url: placeholderUrl } = placeholderData.recipePlaceholder;

  return (
    <div className="group relative">
       <Card className="transition-all duration-300 ease-in-out group-hover:shadow-lg group-hover:border-primary overflow-hidden">
        <div className="flex items-stretch">
            <Link href={`/recipe/${recipe.id}`} className="flex-shrink-0">
                <div className="relative w-32 h-full">
                    <Image
                    src={recipe.image || placeholderUrl}
                    alt={recipe.title}
                    fill
                    className="object-cover"
                    data-ai-hint={aiHint}
                    />
                </div>
            </Link>
            <div className="p-4 flex-1 min-w-0">
              <Link href={`/recipe/${recipe.id}`} className="flex flex-col h-full">
                <Badge variant="secondary" className="mb-1 self-start">{recipe.category}</Badge>
                <h3 className="text-lg font-headline font-semibold leading-tight mb-1 group-hover:text-primary line-clamp-2">
                  {recipe.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-grow">
                  {recipe.description}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm text-muted-foreground mt-auto">
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
              </Link>
            </div>
        </div>
      </Card>

      <div className="absolute top-2 right-2 z-10">
        <AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-background/50 hover:bg-background">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/recipe/${recipe.id}/edit`} className="cursor-pointer">
                  <Pencil className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </Link>
              </DropdownMenuItem>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>

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
      </div>
    </div>
  );
}
