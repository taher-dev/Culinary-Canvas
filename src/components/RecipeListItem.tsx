
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Utensils } from 'lucide-react';
import type { Recipe } from '@/lib/types';

interface RecipeListItemProps {
  recipe: Recipe;
}

export default function RecipeListItem({ recipe }: RecipeListItemProps) {
  return (
    <Link href={`/recipe/${recipe.id}`} className="group block">
      <Card className="transition-all duration-300 ease-in-out group-hover:shadow-lg group-hover:border-primary">
        <CardContent className="p-4 flex items-start gap-4">
          <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md">
            <Image
              src={recipe.image || "https://picsum.photos/seed/1/100/100"}
              alt={recipe.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <Badge variant="secondary" className="mb-1">{recipe.category}</Badge>
            <h3 className="text-lg font-headline font-semibold leading-tight mb-1 group-hover:text-primary truncate">
              {recipe.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-3 h-10 line-clamp-2">
              {recipe.description}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
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
        </CardContent>
      </Card>
    </Link>
  );
}
