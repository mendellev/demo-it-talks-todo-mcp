# Todo MCP Server

A Model Context Protocol (MCP) server for managing todos through a REST API.

## Features

This MCP server provides tools to interact with a Todo application API:

- **create_todo** - Create a new todo item
- **get_all_todos** - Retrieve all todos
- **get_todo_by_id** - Get a specific todo by ID
- **update_todo** - Update an existing todo
- **toggle_todo_completion** - Toggle todo completion status
- **delete_todo** - Delete a todo

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Set the following environment variables:
- `TODO_API_URL` - Your Todo API endpoint (default: http://localhost:3000)
- `API_KEY` - API key for authentication (required)

## Building

```bash
npm run build
```

## Development

Watch mode for development:

```bash
npm run dev
```


## Inspector view
```
npx -y @modelcontextprotocol/inspector  node dist/index.js -e API_KEY=very-secret-value
```

## Usage

The server uses stdio transport for communication. You can use it with any MCP-compatible client.

### Claude Code Configuration
```
claude mcp add --transport=stdio todo -- env API_KEY=very-secret-value node todo-mcp/dist/index.js
```


### Claude Desktop Windows Configuration
```
{
    "mcpServers": {
        "todo":{
            "command": "node",
            "args": [
                "C:\\demo-it-talks-todo-mcp\\dist\\index.js"
            ],
            "env":{
                "API_KEY":"very-secret-value"
            }
        }
    }
}
```

### Example MCP Configuration

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "todo": {
      "command": "node",
      "args": ["/path/to/todo-mcp/dist/index.js"],
      "env": {
        "TODO_API_URL": "http://localhost:3000",
        "API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## API Endpoints

This server connects to a NestJS Todo application with the following endpoints:

- `POST /todos` - Create todo
- `GET /todos` - Get all todos
- `GET /todos/:id` - Get todo by ID
- `PATCH /todos/:id` - Update todo
- `PATCH /todos/:id/toggle` - Toggle completion
- `DELETE /todos/:id` - Delete todo

## Schema

### Todo Entity

```typescript
{
  id: number;
  title: string;
  description: string | null;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Create/Update Todo

```typescript
{
  title: string;          // required for create
  description?: string;   // optional
  isCompleted?: boolean;  // optional
}
```
