'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useRecipes } from '@/hooks/use-recipes';
import { useRouter } from 'next/navigation';
import { PlusCircle, Trash2, Youtube, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { fetchThumbnailAction } from '@/app/add/actions';
import { useToast } from "@/hooks/use-toast"

const recipeFormSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters long.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  category: z.string().min(2, { message: 'Category is required.' }),
  servingSize: z.coerce.number().min(1, { message: 'Serving size must be at least 1.' }),
  time: z.string().min(3, { message: 'Cooking time is required.' }),
  ingredients: z.array(z.object({ value: z.string().min(1, { message: 'Ingredient cannot be empty.' }) })),
  steps: z.array(z.object({ value: z.string().min(1, { message: 'Step cannot be empty.' }) })),
  referenceLink: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
  image: z.string().optional(),
  thumbnailUrl: z.string().optional().nullable(),
});

type RecipeFormValues = z.infer<typeof recipeFormSchema>;

export default function RecipeForm() {
  const router = useRouter();
  const { addRecipe } = useRecipes();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isFetchingThumbnail, setIsFetchingThumbnail] = useState(false);
  const { toast } = useToast();

  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      servingSize: 1,
      time: '',
      ingredients: [{ value: '' }],
      steps: [{ value: '' }],
      referenceLink: '',
      image: '',
      thumbnailUrl: '',
    },
  });

  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
    control: form.control,
    name: 'ingredients',
  });

  const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({
    control: form.control,
    name: 'steps',
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        form.setValue('image', base64String);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleFetchThumbnail = async () => {
    const videoUrl = form.getValues('referenceLink');
    if (!videoUrl) return;

    setIsFetchingThumbnail(true);
    try {
      const result = await fetchThumbnailAction({ videoUrl });
      if (result.thumbnailDataUri) {
        form.setValue('thumbnailUrl', result.thumbnailDataUri);
      }
    } catch (error) {
      console.error("Failed to fetch thumbnail", error);
      toast({
        title: "Error",
        description: "Could not fetch video thumbnail.",
        variant: "destructive",
      });
    } finally {
      setIsFetchingThumbnail(false);
    }
  };


  function onSubmit(data: RecipeFormValues) {
    const newRecipe = {
      ...data,
      id: Date.now().toString(),
      image: imagePreview || '',
    };
    addRecipe(newRecipe);
    router.push('/');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="image"
          render={() => (
            <FormItem>
              <FormLabel>Finished Dish Image</FormLabel>
              <FormControl>
                <>
                  {imagePreview && (
                    <div className="mt-4 relative w-full aspect-video rounded-md overflow-hidden">
                      <Image src={imagePreview} alt="Dish preview" layout="fill" objectFit="cover" />
                    </div>
                  )}
                  <Input type="file" accept="image/*" onChange={handleImageChange} className="mt-2" />
                </>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Classic Spaghetti Bolognese" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="A short note about the dish..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Dinner" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="servingSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Serving Size</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 4" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Time</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 45 minutes" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div>
          <FormLabel>Ingredients</FormLabel>
          {ingredientFields.map((field, index) => (
            <FormField
              key={field.id}
              control={form.control}
              name={`ingredients.${index}.value`}
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 mt-2">
                  <FormControl>
                    <Input placeholder={`Ingredient ${index + 1}`} {...field} />
                  </FormControl>
                  <Button type="button" variant="destructive" size="icon" onClick={() => removeIngredient(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </FormItem>
              )}
            />
          ))}
          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendIngredient({ value: '' })}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Ingredient
          </Button>
        </div>

        <div>
          <FormLabel>Steps</FormLabel>
          {stepFields.map((field, index) => (
            <FormField
              key={field.id}
              control={form.control}
              name={`steps.${index}.value`}
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 mt-2">
                  <span className="font-bold">{index + 1}.</span>
                  <FormControl>
                    <Textarea placeholder={`Step ${index + 1} instructions...`} {...field} />
                  </FormControl>
                  <Button type="button" variant="destructive" size="icon" onClick={() => removeStep(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </FormItem>
              )}
            />
          ))}
          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendStep({ value: '' })}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Step
          </Button>
        </div>
        
        <FormField
          control={form.control}
          name="referenceLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reference Link</FormLabel>
              <FormControl>
                <div className='flex gap-2'>
                    <Input placeholder="https://youtube.com/..." {...field} onBlur={handleFetchThumbnail} />
                    <Button type='button' onClick={handleFetchThumbnail} disabled={isFetchingThumbnail}>
                        {isFetchingThumbnail ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Youtube className="mr-2 h-4 w-4"/>}
                        Fetch Thumbnail
                    </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch('thumbnailUrl') && (
            <div className="mt-4 relative w-full max-w-xs aspect-video rounded-md overflow-hidden">
                <Image src={form.watch('thumbnailUrl')!} alt="Video thumbnail" layout="fill" objectFit="cover" />
            </div>
        )}


        <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Saving...' : 'Save Recipe'}
        </Button>
      </form>
    </Form>
  );
}
