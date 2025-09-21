import RecipeForm from '@/components/RecipeForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AddRecipePage() {
  return (
    <div className="container mx-auto max-w-3xl py-8 px-2 sm:px-4 md:px-6">
      <div className="mb-8">
        <Button variant="ghost" asChild>
            <Link href="/" className='flex items-center gap-2'>
                <ArrowLeft className="h-4 w-4" />
                Back to Recipes
            </Link>
        </Button>
      </div>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold font-headline text-foreground">Add New Recipe</h1>
        <p className="text-muted-foreground">
          Fill in the details below to add a new culinary creation to your history.
        </p>
      </div>
      <div className="mt-8">
        <RecipeForm />
      </div>
    </div>
  );
}
