export interface Todo {
  id: number;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  completed: boolean;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  userId: number;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  completed?: boolean;
}

export interface TodoFilters {
  search?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  completed?: boolean;
  dueDate?: string;
  userId?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'asc' | 'desc';
}

export interface PaginatedTodos {
  content: Todo[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
