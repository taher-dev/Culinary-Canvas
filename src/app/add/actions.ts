'use server';
import { fetchVideoThumbnail } from '@/ai/flows/fetch-video-thumbnail';
import type { FetchVideoThumbnailInput, FetchVideoThumbnailOutput } from '@/ai/flows/fetch-video-thumbnail';

export async function fetchThumbnailAction(input: FetchVideoThumbnailInput): Promise<FetchVideoThumbnailOutput> {
  try {
    const result = await fetchVideoThumbnail(input);
    return result;
  } catch (error) {
    console.error('Error fetching thumbnail:', error);
    // Return a structured error or a specific output schema for errors if needed
    return { thumbnailDataUri: null };
  }
}
