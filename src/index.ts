#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { NeuronpediaClient } from './neuronpedia-client.js';

const server = new Server(
  {
    name: 'neuronpedia-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

let neuronpediaClient: NeuronpediaClient | null = null;

function initializeClient() {
  const apiKey = process.env.NEURONPEDIA_API_KEY;
  if (!apiKey) {
    throw new McpError(
      ErrorCode.InvalidRequest,
      'NEURONPEDIA_API_KEY environment variable is required'
    );
  }
  
  neuronpediaClient = new NeuronpediaClient({ apiKey });
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'generate_explanation',
        description: 'Generate an explanation for a specific feature in an AI model',
        inputSchema: {
          type: 'object',
          properties: {
            model: { type: 'string', description: 'Model name (e.g., gpt2-small)' },
            layer: { type: 'number', description: 'Layer number' },
            feature: { type: 'number', description: 'Feature number' },
          },
          required: ['model', 'layer', 'feature'],
        },
      },
      {
        name: 'search_explanations',
        description: 'Search for explanations across models and layers',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query' },
            model: { type: 'string', description: 'Optional model filter' },
            layer: { type: 'number', description: 'Optional layer filter' },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_activations',
        description: 'Get activation values for a specific feature on given text',
        inputSchema: {
          type: 'object',
          properties: {
            model: { type: 'string', description: 'Model name' },
            layer: { type: 'number', description: 'Layer number' },
            feature: { type: 'number', description: 'Feature number' },
            text: { type: 'string', description: 'Input text to analyze' },
          },
          required: ['model', 'layer', 'feature', 'text'],
        },
      },
      {
        name: 'search_top_features',
        description: 'Find the top activating features for given text',
        inputSchema: {
          type: 'object',
          properties: {
            model: { type: 'string', description: 'Model name' },
            layer: { type: 'number', description: 'Layer number' },
            text: { type: 'string', description: 'Input text to analyze' },
            topK: { type: 'number', description: 'Number of top features to return (default: 10)' },
          },
          required: ['model', 'layer', 'text'],
        },
      },
      {
        name: 'steer_generation',
        description: 'Steer model generation using a specific feature',
        inputSchema: {
          type: 'object',
          properties: {
            model: { type: 'string', description: 'Model name' },
            layer: { type: 'number', description: 'Layer number' },
            feature: { type: 'number', description: 'Feature number' },
            prompt: { type: 'string', description: 'Generation prompt' },
            steeringStrength: { type: 'number', description: 'Steering strength (-10 to 10)' },
            isChat: { type: 'boolean', description: 'Whether this is a chat model (default: false)' },
          },
          required: ['model', 'layer', 'feature', 'prompt', 'steeringStrength'],
        },
      },
      {
        name: 'create_vector',
        description: 'Create a custom vector for steering',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Vector name' },
            values: { type: 'array', items: { type: 'number' }, description: 'Vector values' },
            steeringStrength: { type: 'number', description: 'Optional steering strength' },
          },
          required: ['name', 'values'],
        },
      },
      {
        name: 'list_vectors',
        description: 'List all custom vectors',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_vector',
        description: 'Get a specific vector by ID',
        inputSchema: {
          type: 'object',
          properties: {
            vectorId: { type: 'string', description: 'Vector ID' },
          },
          required: ['vectorId'],
        },
      },
      {
        name: 'delete_vector',
        description: 'Delete a vector by ID',
        inputSchema: {
          type: 'object',
          properties: {
            vectorId: { type: 'string', description: 'Vector ID' },
          },
          required: ['vectorId'],
        },
      },
      {
        name: 'generate_attribution_graph',
        description: 'Generate an attribution graph for analyzing text prompts',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: { type: 'string', description: 'Text prompt to analyze' },
            maxLogits: { type: 'number', description: 'Maximum number of logits (optional)' },
            logitProbability: { type: 'number', description: 'Logit probability threshold (optional)' },
            nodeThreshold: { type: 'number', description: 'Node threshold for graph (optional)' },
            edgeThreshold: { type: 'number', description: 'Edge threshold for graph (optional)' },
          },
          required: ['prompt'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (!neuronpediaClient) {
    initializeClient();
  }

  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'generate_explanation': {
        const { model, layer, feature } = args as { model: string; layer: number; feature: number };
        const result = await neuronpediaClient!.generateExplanation(model, layer, feature);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'search_explanations': {
        const { query, model, layer } = args as { query: string; model?: string; layer?: number };
        const result = await neuronpediaClient!.searchExplanations(query, model, layer);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_activations': {
        const { model, layer, feature, text } = args as { model: string; layer: number; feature: number; text: string };
        const result = await neuronpediaClient!.getActivations(model, layer, feature, text);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'search_top_features': {
        const { model, layer, text, topK } = args as { model: string; layer: number; text: string; topK?: number };
        const result = await neuronpediaClient!.searchTopFeatures(model, layer, text, topK);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'steer_generation': {
        const { model, layer, feature, prompt, steeringStrength, isChat } = args as {
          model: string;
          layer: number;
          feature: number;
          prompt: string;
          steeringStrength: number;
          isChat?: boolean;
        };
        const result = await neuronpediaClient!.steerGeneration(
          model,
          layer,
          feature,
          prompt,
          steeringStrength,
          isChat || false
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'create_vector': {
        const { name: vectorName, values, steeringStrength } = args as {
          name: string;
          values: number[];
          steeringStrength?: number;
        };
        const result = await neuronpediaClient!.createVector(vectorName, values, steeringStrength);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'list_vectors': {
        const result = await neuronpediaClient!.listVectors();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_vector': {
        const { vectorId } = args as { vectorId: string };
        const result = await neuronpediaClient!.getVector(vectorId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'delete_vector': {
        const { vectorId } = args as { vectorId: string };
        await neuronpediaClient!.deleteVector(vectorId);
        return {
          content: [
            {
              type: 'text',
              text: `Vector ${vectorId} deleted successfully`,
            },
          ],
        };
      }

      case 'generate_attribution_graph': {
        const { prompt, maxLogits, logitProbability, nodeThreshold, edgeThreshold } = args as {
          prompt: string;
          maxLogits?: number;
          logitProbability?: number;
          nodeThreshold?: number;
          edgeThreshold?: number;
        };
        const result = await neuronpediaClient!.generateAttributionGraph(
          prompt,
          maxLogits,
          logitProbability,
          nodeThreshold,
          edgeThreshold
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Error calling tool ${name}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Neuronpedia MCP server running on stdio');
}

main().catch(console.error);