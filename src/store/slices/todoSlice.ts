import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Todo, CreateTodoRequest, UpdateTodoRequest, TodoFilters, PaginatedTodos } from '../../types/todo';
import { todoService } from '../../services/todoService';

interface TodoState {
  todos: Todo[];
  currentTodo: Todo | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
  filters: TodoFilters;
}

const initialState: TodoState = {
  todos: [],
  currentTodo: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  },
  filters: {},
};

// Async thunks
export const fetchTodos = createAsyncThunk<
  PaginatedTodos,
  TodoFilters,
  { rejectValue: string }
>(
  'todos/fetchTodos',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await todoService.getTodos(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch todos');
    }
  }
);

export const fetchTodoById = createAsyncThunk(
  'todos/fetchTodoById',
  async (id: number, { rejectWithValue }) => {
    try {
      const todo = await todoService.getTodoById(id);
      return todo;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch todo');
    }
  }
);

export const createTodo = createAsyncThunk(
  'todos/createTodo',
  async (todo: CreateTodoRequest, { rejectWithValue }) => {
    try {
      const newTodo = await todoService.createTodo(todo);
      return newTodo;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create todo');
    }
  }
);

export const updateTodo = createAsyncThunk(
  'todos/updateTodo',
  async ({ id, todo }: { id: number; todo: UpdateTodoRequest }, { rejectWithValue }) => {
    try {
      const updatedTodo = await todoService.updateTodo(id, todo);
      return updatedTodo;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update todo');
    }
  }
);

export const deleteTodo = createAsyncThunk(
  'todos/deleteTodo',
  async (id: number, { rejectWithValue }) => {
    try {
      await todoService.deleteTodo(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete todo');
    }
  }
);

export const patchTodo = createAsyncThunk(
  'todos/patchTodo',
  async ({ id, todo }: { id: number; todo: Partial<UpdateTodoRequest> }, { rejectWithValue }) => {
    try {
      const updatedTodo = await todoService.patchTodo(id, todo);
      return updatedTodo;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to patch todo');
    }
  }
);

const todoSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<TodoFilters>) => {
      state.filters = action.payload;
    },
    clearCurrentTodo: (state) => {
      state.currentTodo = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.isLoading = false;
        state.todos = action.payload.content;
        state.pagination = {
          page: action.payload.number,
          size: action.payload.size,
          totalElements: action.payload.totalElements,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTodoById.fulfilled, (state, action) => {
        state.currentTodo = action.payload;
      })
      .addCase(createTodo.fulfilled, (state, action) => {
        state.todos.unshift(action.payload);
      })
      .addCase(updateTodo.fulfilled, (state, action) => {
        const index = state.todos.findIndex(todo => todo.id === action.payload.id);
        if (index !== -1) {
          state.todos[index] = action.payload;
        }
      })
      .addCase(patchTodo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(patchTodo.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.todos.findIndex(todo => todo.id === action.payload.id);
        if (index !== -1) {
          state.todos[index] = action.payload;
        }
      })
      .addCase(patchTodo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteTodo.fulfilled, (state, action) => {
        state.todos = state.todos.filter(todo => todo.id !== action.payload);
      });
  },
});

export const { setFilters, clearCurrentTodo, clearError } = todoSlice.actions;
export default todoSlice.reducer;
