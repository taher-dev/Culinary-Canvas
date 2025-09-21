
'use client';

import { useRecipes } from '@/hooks/use-recipes';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ChefHat } from 'lucide-react';
import Link from 'next/link';
import VideoEmbed from '@/components/VideoEmbed';
import { Card, CardContent } from '@/components/ui/card';
import type { Recipe } from '@/lib/types';

export default function FollowAlongPage() {
  const params = useParams();
  const router = useRouter();
  const { getRecipeById } = useRecipes();
  const id = typeof params.id === 'string' ? params.id : '';

  const [recipe, setRecipe] = useState<Recipe | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

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


  const handleStepToggle = (index: number) => {
    setCompletedSteps(prev => ({ ...prev, [index]: !prev[index] }));
  };

  if (isLoading || recipe === undefined) {
    return <div>Loading...</div>;
  }

  if (!recipe) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Recipe not found</h2>
        <Button onClick={() => router.push('/')}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl py-8 px-2 sm:px-6 md:px-8">
       <Button variant="ghost" asChild className='mb-8 -ml-4'>
        <Link href={`/recipe/${id}`} className='flex items-center gap-2'>
          <ArrowLeft className="h-4 w-4" />
          Back to Recipe Details
        </Link>
      </Button>

      <div className="flex items-center gap-3 mb-6">
        <ChefHat className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold font-headline text-foreground">Follow Along: {recipe.title}</h1>
      </div>
      
      {recipe.referenceLink ? (
        <div className="mb-8">
          <VideoEmbed url={recipe.referenceLink} />
        </div>
      ) : (
        <div className="text-center py-10 bg-muted rounded-lg mb-8">
            <p className="text-muted-foreground">No reference video available for this recipe.</p>
        </div>
      )}

      <Card>
        <CardContent className="p-6">
            <h2 className="text-2xl font-bold font-headline mb-4">Steps</h2>
            <div className="space-y-4">
                {recipe.steps.map((step, index) => (
                    <div
                        key={index}
                        className={`flex items-start gap-4 p-4 rounded-md transition-colors ${
                            completedSteps[index] ? 'bg-accent' : 'bg-background'
                        }`}
                    >
                        <Checkbox
                            id={`step-${index}`}
                            checked={!!completedSteps[index]}
                            onCheckedChange={() => handleStepToggle(index)}
                            className="mt-1 h-5 w-5"
                        />
                        <Label
                            htmlFor={`step-${index}`}
                            className={`flex-1 text-base leading-relaxed ${
                            completedSteps[index] ? 'line-through text-muted-foreground' : 'text-foreground'
                            }`}
                        >
                            <span className="font-bold">Step {index + 1}:</span> {step.value}
                        </Label>
                    </div>
                ))}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
