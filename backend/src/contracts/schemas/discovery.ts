import { z } from "zod";
import { EventSchema } from "./events.js";

export const FeedSectionTypeSchema = z.enum([
  "hero",
  "this_week",
  "for_you",
  "closing_soon",
  "trending",
  "because_you_joined",
]);
export type FeedSectionType = z.infer<typeof FeedSectionTypeSchema>;

export const FeedSectionSchema = z.object({
  id: z.string(),
  type: FeedSectionTypeSchema,
  title: z.string(),
  subtitle: z.string().optional(),
  reason: z.string().optional(),
  events: z.array(EventSchema),
});
export type FeedSection = z.infer<typeof FeedSectionSchema>;

export const FeedResponseSchema = z.object({
  sections: z.array(FeedSectionSchema),
  timestamp: z.string().datetime(),
});
export type FeedResponse = z.infer<typeof FeedResponseSchema>;

export const SearchSuggestResponseSchema = z.object({
  query: z.string(),
  suggestions: z.array(
    z.object({
      id: z.string().uuid(),
      title: z.string(),
      category: z.string(),
      startsAt: z.string().datetime(),
    }),
  ),
  clubs: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
    }),
  ),
});
export type SearchSuggestResponse = z.infer<typeof SearchSuggestResponseSchema>;

export const NaturalLanguageSearchRequestSchema = z.object({
  prompt: z.string().min(3).max(200),
});
export type NaturalLanguageSearchRequest = z.infer<
  typeof NaturalLanguageSearchRequestSchema
>;

export const NaturalLanguageSearchResponseSchema = z.object({
  resolvedFilters: z.object({
    category: z.string().optional(),
    freeOnly: z.boolean().optional(),
    startsAfter: z.string().datetime().optional(),
    startsBefore: z.string().datetime().optional(),
    q: z.string().optional(),
  }),
  explanation: z.string(),
  matchedEvents: z.array(EventSchema),
});
export type NaturalLanguageSearchResponse = z.infer<
  typeof NaturalLanguageSearchResponseSchema
>;
