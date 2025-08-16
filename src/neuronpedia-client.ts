import axios, { AxiosInstance } from 'axios';
import { NeuronpediaConfig, Explanation, Activation, FeatureSearch, SteeringResult, Vector } from './types.js';

export class NeuronpediaClient {
  private client: AxiosInstance;

  constructor(config: NeuronpediaConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl || 'https://www.neuronpedia.org/api',
      headers: {
        'x-api-key': config.apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  async generateExplanation(model: string, layer: number, feature: number): Promise<Explanation> {
    const response = await this.client.post('/explanations/generate', {
      model,
      layer,
      feature,
    });
    return response.data;
  }

  async searchExplanations(query: string, model?: string, layer?: number): Promise<Explanation[]> {
    const response = await this.client.get('/explanations/search', {
      params: { query, model, layer },
    });
    return response.data;
  }

  async scoreExplanation(explanationId: string, score: number): Promise<void> {
    await this.client.post(`/explanations/${explanationId}/score`, { score });
  }

  async deleteExplanation(explanationId: string): Promise<void> {
    await this.client.delete(`/explanations/${explanationId}`);
  }

  async getActivations(model: string, layer: number, feature: number, text: string): Promise<Activation[]> {
    const response = await this.client.post('/activations', {
      model,
      layer,
      feature,
      text,
    });
    return response.data;
  }

  async searchTopFeatures(model: string, layer: number, text: string, topK?: number): Promise<FeatureSearch> {
    const response = await this.client.post('/search/top-features', {
      model,
      layer,
      text,
      top_k: topK || 10,
    });
    return response.data;
  }

  async steerGeneration(
    model: string,
    layer: number,
    feature: number,
    prompt: string,
    steeringStrength: number,
    isChat: boolean = false
  ): Promise<SteeringResult> {
    const response = await this.client.post('/steering/generate', {
      model,
      layer,
      feature,
      prompt,
      steering_strength: steeringStrength,
      is_chat: isChat,
    });
    return response.data;
  }

  async createVector(name: string, values: number[], steeringStrength?: number): Promise<Vector> {
    const response = await this.client.post('/vectors', {
      name,
      values,
      steering_strength: steeringStrength,
    });
    return response.data;
  }

  async getVector(vectorId: string): Promise<Vector> {
    const response = await this.client.get(`/vectors/${vectorId}`);
    return response.data;
  }

  async listVectors(): Promise<Vector[]> {
    const response = await this.client.get('/vectors');
    return response.data;
  }

  async deleteVector(vectorId: string): Promise<void> {
    await this.client.delete(`/vectors/${vectorId}`);
  }
}