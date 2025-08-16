# Neuronpedia MCP Server

A Model Context Protocol (MCP) server that provides access to the Neuronpedia API for AI model interpretability and feature analysis.

## Features

- **Explanations**: Generate and search explanations for AI model features
- **Activations**: Analyze feature activations on specific text inputs
- **Steering**: Control model generation using specific features
- **Vectors**: Create and manage custom steering vectors

## Installation

```bash
npm install
npm run build
```

## Configuration

Set your Neuronpedia API key as an environment variable:

```bash
export NEURONPEDIA_API_KEY=your_api_key_here
```

You can obtain your API key by logging in at [neuronpedia.org](https://neuronpedia.org) and visiting your account page.

## Usage

### Running the server

```bash
npm start
```

### Available Tools

1. **generate_explanation** - Generate explanations for model features
2. **search_explanations** - Search existing explanations
3. **get_activations** - Get feature activations for text
4. **search_top_features** - Find top activating features
5. **steer_generation** - Steer model generation with features
6. **create_vector** - Create custom steering vectors
7. **list_vectors** - List all vectors
8. **get_vector** - Get specific vector
9. **delete_vector** - Delete a vector

### MCP Client Configuration

Add this to your MCP client configuration:

```json
{
  "mcpServers": {
    "neuronpedia": {
      "command": "node",
      "args": ["/path/to/neuronpedia-mcp/dist/index.js"],
      "env": {
        "NEURONPEDIA_API_KEY": "your_api_key"
      }
    }
  }
}
```

## Development

```bash
npm run dev
```

## License

MIT