import React, { useEffect, useState, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../store';
import { fetchTodos, createTodo } from '../store/slices/todoSlice';
import { Plus, Calendar, CheckCircle, Clock, TrendingUp, X, Filter, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import type { CreateTodoRequest, TodoFilters } from '../types/todo';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

export const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { todos, isLoading, error } = useAppSelector((state) => state.todos);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState<TodoFilters>({
    page: 0,
    size: 10,
    sortBy: 'createdAt',
    direction: 'desc'
  });

  // Debounced search function
  const debouncedSearch = useCallback(
    (searchValue: string) => {
      setFilters(prev => ({ ...prev, search: searchValue || undefined }));
    },
    []
  );

  const [searchInput, setSearchInput] = useState(filters.search || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedSearch(searchInput);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchInput, debouncedSearch]);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTodoRequest>();
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    overdue: 0,
  });

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchTodos({ ...filters, userId: user.id }));
    }
  }, []); // Only run on mount

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchTodos({ ...filters, userId: user.id }));
    }
  }, [filters, dispatch, user?.id]); // Run when filters or user changes

  useEffect(() => {
    if (todos.length > 0) {
      const completed = todos.filter(todo => todo.completed).length;
      const pending = todos.filter(todo => todo.status === 'PENDING').length;
      const inProgress = todos.filter(todo => todo.status === 'IN_PROGRESS').length;
      const overdue = todos.filter(todo => 
        todo.dueDate && 
        new Date(todo.dueDate) < new Date() && 
        !todo.completed
      ).length;

      setStats({
        total: todos.length,
        completed,
        pending,
        inProgress,
        overdue,
      });
    }
  }, [todos]);

  const recentTodos = todos.slice(0, 5);

  const refreshTodos = () => {
    if (user?.id) {
      dispatch(fetchTodos({ ...filters, userId: user.id }));
    }
  };

  const handleCreateTodo = async (data: CreateTodoRequest) => {
    try {
      await dispatch(createTodo(data)).unwrap();
      toast.success('Task created successfully!');
      setShowCreateForm(false);
      reset();
      refreshTodos(); // Refresh todos after creation
    } catch (error: any) {
      toast.error(error.message || 'Failed to create task');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'text-error-700 bg-error-100 border-error-200';
      case 'MEDIUM':
        return 'text-warning-700 bg-warning-100 border-warning-200';
      case 'LOW':
        return 'text-success-700 bg-success-100 border-success-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-success-700 bg-success-100 border-success-200';
      case 'IN_PROGRESS':
        return 'text-info-700 bg-info-100 border-info-200';
      case 'PENDING':
        return 'text-warning-700 bg-warning-100 border-warning-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium">Error loading dashboard</div>
          <div className="text-gray-600 mt-2">{error}</div>
          <button 
            onClick={refreshTodos}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-primary-600 flex items-center justify-center">
                <span className="text-white text-lg font-medium">
                  {user?.username?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Welcome, {user?.username}!
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Here's what's happening with your tasks today.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Filters</h3>
            <div className="flex space-x-2">
              <button
                onClick={refreshTodos}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Search
              </label>
              <input
                type="text"
                id="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search tasks..."
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status-filter"
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as any || undefined })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority-filter" className="block text-sm font-medium text-gray-700">
                Priority
              </label>
              <select
                id="priority-filter"
                value={filters.priority || ''}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value as any || undefined })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">All Priority</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div>
              <label htmlFor="completed-filter" className="block text-sm font-medium text-gray-700">
                Completed
              </label>
              <select
                id="completed-filter"
                value={filters.completed === undefined ? '' : filters.completed.toString()}
                onChange={(e) => setFilters({ 
                  ...filters, 
                  completed: e.target.value === '' ? undefined : e.target.value === 'true' 
                })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">All</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>

            <div>
              <label htmlFor="dueDate-filter" className="block text-sm font-medium text-gray-700">
                Due Date & Time
              </label>
              <input
                type="datetime-local"
                id="dueDate-filter"
                value={filters.dueDate ? new Date(filters.dueDate).toISOString().slice(0, 16) : ''}
                onChange={(e) => setFilters({ 
                  ...filters, 
                  dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined 
                })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                const defaultFilters: TodoFilters = {
                  page: 0,
                  size: 10,
                  sortBy: 'createdAt',
                  direction: 'desc'
                };
                setFilters(defaultFilters);
                setSearchInput('');
                setTimeout(() => refreshTodos(), 0);
              }}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-full p-3">
                <TrendingUp className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-lg font-medium text-gray-900 truncate">Total Tasks</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.total}</dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-full p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-lg font-medium text-gray-900 truncate">Completed</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.completed}</dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-full p-3">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-lg font-medium text-gray-900 truncate">In Progress</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.inProgress}</dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-full p-3">
                <Calendar className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-lg font-medium text-gray-900 truncate">Overdue</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.overdue}</dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Tasks</h3>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </button>
          </div>

          {recentTodos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating your first task item.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTodos.map((todo) => (
                <div key={todo.id} className="border-l-4 border-gray-200 pl-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(todo.priority)}`}>
                        {todo.priority}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(todo.status)}`}>
                        {todo.status}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {todo.dueDate && format(new Date(todo.dueDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-900">{todo.title}</p>
                    {todo.description && (
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">{todo.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Todo Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowCreateForm(false);
              }
            }}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit(handleCreateTodo)}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Todo</h3>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Title
                      </label>
                      <input
                        type="text"
                        id="title"
                        {...register('title', { required: 'Title is required' })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="Enter todo title"
                      />
                      {errors.title && (
                        <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        id="description"
                        rows={3}
                        {...register('description')}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="Enter todo description (optional)"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                          Priority
                        </label>
                        <select
                          id="priority"
                          {...register('priority')}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                          Status
                        </label>
                        <select
                          id="status"
                          {...register('status')}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                        Due Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        id="dueDate"
                        {...register('dueDate')}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Create Todo
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
