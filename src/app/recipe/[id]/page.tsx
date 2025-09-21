'use client';

import { useRecipes } from '@/hooks/use-recipes';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, ChefHat, Clock, ExternalLink, Users } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getRecipeById, isLoading } = useRecipes();
  const id = typeof params.id === 'string' ? params.id : '';
  const recipe = getRecipeById(id);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-2 sm:px-6 md:px-8 animate-pulse">
        <div className="h-8 w-1/4 bg-muted rounded-md mb-8"></div>
        <div className="aspect-[16/9] w-full bg-muted rounded-lg mb-6"></div>
        <div className="h-6 w-1/2 bg-muted rounded-md mb-4"></div>
        <div className="h-4 w-full bg-muted rounded-md mb-2"></div>
        <div className="h-4 w-3/4 bg-muted rounded-md"></div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold font-headline">Recipe not found</h2>
        <p className="text-muted-foreground mt-2 mb-4">
          The recipe you're looking for doesn't exist.
        </p>
        <Button onClick={() => router.push('/')}>Go back to safety</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-2 sm:px-6 md:px-8">
      <Button variant="ghost" asChild className='mb-8'>
        <Link href="/" className='flex items-center gap-2'>
          <ArrowLeft className="h-4 w-4" />
          Back to All Recipes
        </Link>
      </Button>

      <article>
        <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden mb-6 shadow-lg">
          <Image
            src={recipe.image || "https://picsum.photos/seed/2/1280/720"}
            alt={recipe.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        <Badge variant="secondary" className="mb-2">{recipe.category}</Badge>
        <h1 className="text-3xl sm:text-4xl font-bold font-headline text-foreground mb-4">{recipe.title}</h1>
        <p className="text-base sm:text-lg text-muted-foreground mb-6">{recipe.description}</p>

        <div className="flex flex-wrap gap-x-6 gap-y-3 items-center text-foreground mb-6">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <span>{recipe.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span>Serves {recipe.servingSize}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Link href={`/recipe/${recipe.id}/follow`} passHref className="w-full sm:w-auto">
                <Button size="lg" className="w-full">
                    <ChefHat className="mr-2 h-5 w-5" />
                    Follow Along
                </Button>
            </Link>
            {recipe.referenceLink && (
                <a href={recipe.referenceLink} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full">
                        View Original Video
                        <ExternalLink className="ml-2 h-5 w-5" />
                    </Button>
                </a>
            )}
        </div>
        
        <Separator className="my-8" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
                <h2 className="text-2xl font-bold font-headline mb-4">Ingredients</h2>
                <ul className="space-y-2 list-disc list-inside text-foreground">
                    {recipe.ingredients.map((ing, index) => (
                        <li key={index}>{ing.value}</li>
                    ))}
                </ul>
            </div>
            <div className="md:col-span-2">
                <h2 className="text-2xl font-bold font-headline mb-4">Steps</h2>
                <ol className="space-y-4">
                    {recipe.steps.map((step, index) => (
                        <li key={index} className="flex gap-4">
                            <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold flex-shrink-0 mt-1">
                                {index + 1}
                            </span>
                            <p className="flex-1 pt-1.5">{step.value}</p>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
      </article>
    </div>
  );
}
