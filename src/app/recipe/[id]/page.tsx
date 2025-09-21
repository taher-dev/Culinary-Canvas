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
      <div className="container mx-auto max-w-4xl animate-pulse py-8 px-2 sm:px-6 md:px-8">
        <div className="mb-8 h-8 w-1/4 rounded-md bg-muted"></div>
        <div className="mb-6 aspect-[16/9] w-full rounded-lg bg-muted"></div>
        <div className="mb-4 h-6 w-1/2 rounded-md bg-muted"></div>
        <div className="mb-2 h-4 w-full rounded-md bg-muted"></div>
        <div className="h-4 w-3/4 rounded-md bg-muted"></div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold font-headline">Recipe not found</h2>
        <p className="mt-2 mb-4 text-muted-foreground">
          The recipe you're looking for doesn't exist.
        </p>
        <Button onClick={() => router.push('/')}>Go back to safety</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-2 sm:px-6 md:px-8">
      <Button variant="ghost" asChild className='-ml-4 mb-8'>
        <Link href="/" className='flex items-center gap-2'>
          <ArrowLeft className="h-4 w-4" />
          Back to All Recipes
        </Link>
      </Button>

      <article>
        <div className="relative mb-6 aspect-[16/9] w-full overflow-hidden rounded-lg shadow-lg">
          <Image
            src={recipe.image || "https://picsum.photos/seed/2/1280/720"}
            alt={recipe.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        <Badge variant="secondary" className="mb-2">{recipe.category}</Badge>
        <h1 className="mb-4 text-3xl font-bold font-headline text-foreground sm:text-4xl">{recipe.title}</h1>
        <p className="mb-6 text-base text-muted-foreground sm:text-lg">{recipe.description}</p>

        <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <span>{recipe.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span>Serves {recipe.servingSize}</span>
          </div>
        </div>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row">
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
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="md:col-span-1">
                <h2 className="mb-4 text-2xl font-bold font-headline">Ingredients</h2>
                <ul className="list-inside list-disc space-y-2 text-foreground">
                    {recipe.ingredients.map((ing, index) => (
                        <li key={index}>
                            {ing.quantity && <strong className='mr-1'>{ing.quantity}</strong>}{' '}
                            {ing.value}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="md:col-span-2">
                <h2 className="mb-4 text-2xl font-bold font-headline">Steps</h2>
                <ol className="space-y-4">
                    {recipe.steps.map((step, index) => (
                        <li key={index} className="flex gap-4">
                            <span className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
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
