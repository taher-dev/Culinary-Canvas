
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Utensils } from 'lucide-react';
import type { Recipe } from '@/lib/types';

interface RecipeListItemProps {
  recipe: Recipe;
}

export default function RecipeListItem({ recipe }: RecipeListItemProps) {
  return (
    <Link href={`/recipe/${recipe.id}`} className="group block">
      <Card className="transition-all duration-300 ease-in-out group-hover:shadow-lg group-hover:border-primary overflow-hidden">
        <div className="flex">
            <div className="relative h-36 w-32 flex-shrink-0">
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
  );
}
