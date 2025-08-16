import { z } from 'zod';

export const ExplanationSchema = z.object({
  id: z.string(),
  text: z.string(),
  model: z.string(),
  layer: z.number(),
  feature: z.number(),
  score: z.number().optional(),
});

export const ActivationSchema = z.object({
  feature: z.number(),
  activation: z.number(),
  token: z.string(),
  position: z.number(),
});

export const FeatureSearchSchema = z.object({
  features: z.array(z.object({
    feature: z.number(),
    activation: z.number(),
  })),
  tokens: z.array(z.string()),
});

export const SteeringResultSchema = z.object({
  text: z.string(),
  steering_strength: z.number(),
  feature: z.number(),
});

export const VectorSchema = z.object({
  id: z.string(),
  name: z.string(),
  values: z.array(z.number()),
  steering_strength: z.number().optional(),
});

export const AttributionGraphSchema = z.object({
  graph_url: z.string(),
  metadata: z.object({
    nodes: z.number(),
    links: z.number(),
    model: z.string(),
    prompt: z.string(),
  }),
});

export type Explanation = z.infer<typeof ExplanationSchema>;
export type Activation = z.infer<typeof ActivationSchema>;
export type FeatureSearch = z.infer<typeof FeatureSearchSchema>;
export type SteeringResult = z.infer<typeof SteeringResultSchema>;
export type Vector = z.infer<typeof VectorSchema>;
export type AttributionGraph = z.infer<typeof AttributionGraphSchema>;

export interface NeuronpediaConfig {
  apiKey: string;
  baseUrl?: string;
}