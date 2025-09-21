
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Utensils } from 'lucide-react';
import type { Recipe } from '@/lib/types';

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link href={`/recipe/${recipe.id}`} className="group block">
      <Card className="h-full overflow-hidden transition-all duration-300 ease-in-out group-hover:shadow-xl group-hover:-translate-y-1">
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
      </Card>
    </Link>
  );
}
