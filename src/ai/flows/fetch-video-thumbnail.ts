'use server';

/**
 * @fileOverview This file defines a Genkit flow to fetch a video thumbnail from a given URL.
 *
 * - fetchVideoThumbnail - A function that takes a video URL as input and returns the video thumbnail as a data URI.
 * - FetchVideoThumbnailInput - The input type for the fetchVideoThumbnail function.
 * - FetchVideoThumbnailOutput - The return type for the fetchVideoThumbnail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FetchVideoThumbnailInputSchema = z.object({
  videoUrl: z
    .string()
    .describe('The URL of the video from which to fetch the thumbnail.'),
});
export type FetchVideoThumbnailInput = z.infer<typeof FetchVideoThumbnailInputSchema>;

const FetchVideoThumbnailOutputSchema = z.object({
  thumbnailDataUri:
    z.string().describe('The video thumbnail as a data URI, or null if not found.'),
});
export type FetchVideoThumbnailOutput = z.infer<typeof FetchVideoThumbnailOutputSchema>;

export async function fetchVideoThumbnail(input: FetchVideoThumbnailInput): Promise<FetchVideoThumbnailOutput> {
  return fetchVideoThumbnailFlow(input);
}

const prompt = ai.definePrompt({
  name: 'fetchVideoThumbnailPrompt',
  input: {schema: FetchVideoThumbnailInputSchema},
  output: {schema: FetchVideoThumbnailOutputSchema},
  prompt: `You are an expert at extracting video thumbnails from URLs.

  Given a video URL, extract the video thumbnail URL. If no thumbnail is available, respond with null.

  Video URL: {{{videoUrl}}}
  `,
});

const fetchVideoThumbnailFlow = ai.defineFlow(
  {
    name: 'fetchVideoThumbnailFlow',
    inputSchema: FetchVideoThumbnailInputSchema,
    outputSchema: FetchVideoThumbnailOutputSchema,
  },
  async input => {
    //TODO: Implement the logic to fetch the video thumbnail using a service. For the MVP, this can be a placeholder.
    //In the full implementation, you would use a service or library to extract the thumbnail from the video URL.
    //This placeholder returns null.
    //For example, if the video URL is a YouTube video, you can construct the thumbnail URL as follows:
    //https://img.youtube.com/vi/<video_id>/0.jpg

    // Extract the video ID from the YouTube URL
    function extractVideoId(url: string): string | null {
      const regExp = /^.*(?:(?:youtu\.be\/|v\/|shorts\/|requires_channel_code=true\&)\w*=*|youtube\.com(?:\/|\/(?:watch\?|embed\/))\w*=*)([^#\&\?]*).*/;
      const match = url.match(regExp);
      if (match && match[1]) {
        return match[1];
      }
      return null;
    }

    const videoId = extractVideoId(input.videoUrl);

    let thumbnailDataUri: string | null = null;

    if (videoId) {
      thumbnailDataUri = `https://img.youtube.com/vi/${videoId}/0.jpg`;
    }

    return {thumbnailDataUri: thumbnailDataUri};
  }
);
