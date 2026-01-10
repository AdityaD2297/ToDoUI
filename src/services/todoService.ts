import http from '../api/http';
import type { Todo, CreateTodoRequest, UpdateTodoRequest, TodoFilters, PaginatedTodos } from '../types/todo';

export const todoService = {
  getTodos: async (filters: TodoFilters = {}): Promise<PaginatedTodos> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const response = await http.get<PaginatedTodos>(`/api/todo?${params.toString()}`);
    return response.data;
  },

  getTodoById: async (id: number): Promise<Todo> => {
    const response = await http.get<Todo>(`/api/todo/${id}`);
    return response.data;
  },

  createTodo: async (todo: CreateTodoRequest): Promise<Todo> => {
    const response = await http.post<Todo>('/api/todo', todo);
    return response.data;
  },

  updateTodo: async (id: number, todo: UpdateTodoRequest): Promise<Todo> => {
    const response = await http.put<Todo>(`/api/todo/${id}`, todo);
    return response.data;
  },

  patchTodo: async (id: number, todo: Partial<UpdateTodoRequest>): Promise<Todo> => {
    const response = await http.patch<Todo>(`/api/todo/${id}`, todo);
    return response.data;
  },

  deleteTodo: async (id: number): Promise<void> => {
    await http.delete(`/api/todo/${id}`);
  },
};
