#!/usr/bin/env node

import { FastMCP } from "fastmcp";
import { z } from "zod";

// Configuration
const API_BASE_URL = process.env.TODO_API_URL || "http://localhost:3000";
const API_KEY = process.env.API_KEY;

// Validate API_KEY is set
if (!API_KEY) {
  console.error("Error: API_KEY environment variable is required but not set.");
  console.error("Please set the API_KEY environment variable and try again.");
  process.exit(1);
}

// Zod Schemas for Todo application

// Todo entity schema
const TodoSchema = z.object({
  id: z.number().describe("The unique identifier of the todo"),
  title: z.string().describe("The title of the todo"),
  description: z.string().nullable().describe("The description of the todo"),
  isCompleted: z.boolean().describe("Whether the todo is completed"),
  createdAt: z.string().describe("The date when the todo was created"),
  updatedAt: z.string().describe("The date when the todo was last updated"),
});

// Create Todo DTO schema
const CreateTodoDtoSchema = z.object({
  title: z.string().min(1).describe("The title of the todo (required)"),
  description: z
    .string()
    .optional()
    .describe("The description of the todo (optional)"),
  isCompleted: z
    .boolean()
    .optional()
    .describe("Whether the todo is completed (optional, default: false)"),
});

// Update Todo DTO schema
const UpdateTodoDtoSchema = z.object({
  title: z.string().min(1).optional().describe("The title of the todo"),
  description: z.string().optional().describe("The description of the todo"),
  isCompleted: z.boolean().optional().describe("Whether the todo is completed"),
});

// Tool input schemas
const GetTodoByIdSchema = z.object({
  id: z.number().positive().describe("The ID of the todo to retrieve"),
});

const UpdateTodoSchema = z.object({
  id: z.number().positive().describe("The ID of the todo to update"),
  title: z.string().min(1).optional().describe("The title of the todo"),
  description: z.string().optional().describe("The description of the todo"),
  isCompleted: z.boolean().optional().describe("Whether the todo is completed"),
});

const ToggleTodoSchema = z.object({
  id: z.number().positive().describe("The ID of the todo to toggle"),
});

const DeleteTodoSchema = z.object({
  id: z.number().positive().describe("The ID of the todo to delete"),
});

// Types
type Todo = z.infer<typeof TodoSchema>;
type CreateTodoDto = z.infer<typeof CreateTodoDtoSchema>;
type UpdateTodoDto = z.infer<typeof UpdateTodoDtoSchema>;

// API Helper functions
async function apiRequest<T>(
  endpoint: string,
  method: string = "GET",
  body?: unknown
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY!,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}. ${errorText}`
    );
  }

  // Handle 204 No Content responses
  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

// Initialize FastMCP server
const server = new FastMCP({
  name: "todo-mcp-server",
  version: "1.0.0",
});

// Register tools

// 1. Create Todo
server.addTool({
  name: "create_todo",
  description: "Create a new todo item with a title, optional description, and optional completion status",
  parameters: CreateTodoDtoSchema,
  execute: async (input) => {
    const todo = await apiRequest<Todo>("/todos", "POST", input);
    return JSON.stringify(todo, null, 2);
  },
});

// 2. Get All Todos
server.addTool({
  name: "get_all_todos",
  description: "Retrieve all todo items from the database",
  parameters: z.object({}),
  execute: async () => {
    const todos = await apiRequest<Todo[]>("/todos", "GET");
    return JSON.stringify(todos, null, 2);
  },
});

// 3. Get Todo By ID
server.addTool({
  name: "get_todo_by_id",
  description: "Retrieve a specific todo item by its unique ID",
  parameters: GetTodoByIdSchema,
  execute: async ({ id }) => {
    const todo = await apiRequest<Todo>(`/todos/${id}`, "GET");
    return JSON.stringify(todo, null, 2);
  },
});

// 4. Update Todo
server.addTool({
  name: "update_todo",
  description: "Update an existing todo item by its ID. You can update the title, description, or completion status",
  parameters: UpdateTodoSchema,
  execute: async ({ id, ...updateData }) => {
    const todo = await apiRequest<Todo>(`/todos/${id}`, "PATCH", updateData);
    return JSON.stringify(todo, null, 2);
  },
});

// 5. Toggle Todo Completion
server.addTool({
  name: "toggle_todo_completion",
  description: "Toggle the completion status of a todo item (completed <-> not completed)",
  parameters: ToggleTodoSchema,
  execute: async ({ id }) => {
    const todo = await apiRequest<Todo>(`/todos/${id}/toggle`, "PATCH");
    return JSON.stringify(todo, null, 2);
  },
});

// 6. Delete Todo
server.addTool({
  name: "delete_todo",
  description: "Delete a todo item by its ID",
  parameters: DeleteTodoSchema,
  execute: async ({ id }) => {
    await apiRequest<void>(`/todos/${id}`, "DELETE");
    return `Todo with ID ${id} has been successfully deleted.`;
  },
});

// Start server
server.start({
  transportType: "stdio",
});
