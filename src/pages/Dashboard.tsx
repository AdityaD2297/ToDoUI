import React, { useEffect, useState, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../store';
import { fetchTodos, createTodo } from '../store/slices/todoSlice';
import { Plus, Calendar, CheckCircle, Clock, TrendingUp, X, Filter, RotateCcw, AlertCircle } from 'lucide-react';
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
  const [showFilters, setShowFilters] = useState(true);

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
    // Calculate stats dynamically based on filtered todos
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
  }, [todos]);

  const recentTodos = todos.slice(0, 5);

  const refreshTodos = () => {
    if (user?.id) {
      dispatch(fetchTodos({ ...filters, userId: user.id }));
    }
  };

  const handleCreateTodo = async (data: CreateTodoRequest) => {
    try {
      // Convert datetime-local format to ISO string
      const todoData: CreateTodoRequest = {
        ...data,
        dueDate: data.dueDate && data.dueDate.trim() ? new Date(data.dueDate).toISOString() : undefined,
      };
      await dispatch(createTodo(todoData)).unwrap();
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 rounded-full animate-pulse"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="mt-4 text-sm font-medium text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white/80 backdrop-blur-sm shadow-soft rounded-2xl border border-gray-100/50 overflow-hidden">
          <div className="px-8 py-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-colored-primary">
                <span className="text-white text-lg font-bold">
                  {user?.username?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                  Welcome back, {user?.username}!
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Here's what's happening with your tasks today.
                </p>
              </div>
            </div>
          </div>
        </div>

      {/* Filters Section */}
        <div className="bg-white/80 backdrop-blur-sm shadow-soft rounded-2xl border border-gray-100/50 mt-6 overflow-hidden">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Filter className="h-5 w-5 text-gray-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Filters</h3>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={refreshTodos}
                  className="group inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 transform hover:scale-105"
                >
                  <RotateCcw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                  Refresh
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="group inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 transform hover:scale-105"
                >
                  <Filter className={`h-4 w-4 mr-2 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
              </div>
            </div>
            
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="space-y-6">
                {/* Search and Basic Filters */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <div>
                    <label htmlFor="search" className="block text-sm font-semibold text-gray-700 mb-2">
                      Search Tasks
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="search"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search tasks..."
                        className="block w-full border-gray-200 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm px-4 py-3 border transition-all duration-200"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <Filter className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="status-filter" className="block text-sm font-semibold text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      id="status-filter"
                      value={filters.status || ''}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value as any || undefined })}
                      className="block w-full border-gray-200 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm px-4 py-3 border transition-all duration-200 cursor-pointer"
                    >
                      <option value="">All Status</option>
                      <option value="PENDING">🔄 Pending</option>
                      <option value="IN_PROGRESS">⚡ In Progress</option>
                      <option value="COMPLETED">✅ Completed</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="priority-filter" className="block text-sm font-semibold text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      id="priority-filter"
                      value={filters.priority || ''}
                      onChange={(e) => setFilters({ ...filters, priority: e.target.value as any || undefined })}
                      className="block w-full border-gray-200 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm px-4 py-3 border transition-all duration-200 cursor-pointer"
                    >
                      <option value="">All Priority</option>
                      <option value="LOW">🟢 Low</option>
                      <option value="MEDIUM">🟡 Medium</option>
                      <option value="HIGH">🔴 High</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="completed-filter" className="block text-sm font-semibold text-gray-700 mb-2">
                      Completed
                    </label>
                    <select
                      id="completed-filter"
                      value={filters.completed === undefined ? '' : filters.completed.toString()}
                      onChange={(e) => setFilters({ 
                        ...filters, 
                        completed: e.target.value === '' ? undefined : e.target.value === 'true' 
                      })}
                      className="block w-full border-gray-200 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm px-4 py-3 border transition-all duration-200 cursor-pointer"
                    >
                      <option value="">All</option>
                      <option value="true">✅ Yes</option>
                      <option value="false">❌ No</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="dueDate-filter" className="block text-sm font-semibold text-gray-700 mb-2">
                      Due Date & Time
                    </label>
                    <div className="relative">
                      <input
                        type="datetime-local"
                        id="dueDate-filter"
                        value={filters.dueDate ? new Date(filters.dueDate).toISOString().slice(0, 16) : ''}
                        onChange={(e) => setFilters({ 
                          ...filters, 
                          dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined 
                        })}
                        className="block w-full border-gray-200 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm px-4 py-3 border transition-all duration-200"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <Calendar className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pagination and Sorting Controls */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label htmlFor="page-filter" className="block text-sm font-semibold text-gray-700 mb-2">
                      Page
                    </label>
                    <select
                      id="page-filter"
                      value={filters.page || 0}
                      onChange={(e) => setFilters({ ...filters, page: parseInt(e.target.value) })}
                      className="block w-full border-gray-200 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm px-4 py-3 border transition-all duration-200 cursor-pointer"
                    >
                      <option value="0">Page 1</option>
                      <option value="1">Page 2</option>
                      <option value="2">Page 3</option>
                      <option value="3">Page 4</option>
                      <option value="4">Page 5</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="size-filter" className="block text-sm font-semibold text-gray-700 mb-2">
                      Items per Page
                    </label>
                    <select
                      id="size-filter"
                      value={filters.size || 10}
                      onChange={(e) => setFilters({ ...filters, size: parseInt(e.target.value) })}
                      className="block w-full border-gray-200 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm px-4 py-3 border transition-all duration-200 cursor-pointer"
                    >
                      <option value="5">5 items</option>
                      <option value="10">10 items</option>
                      <option value="20">20 items</option>
                      <option value="50">50 items</option>
                      <option value="100">100 items</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="sortBy-filter" className="block text-sm font-semibold text-gray-700 mb-2">
                      Sort By
                    </label>
                    <select
                      id="sortBy-filter"
                      value={filters.sortBy || 'createdAt'}
                      onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                      className="block w-full border-gray-200 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm px-4 py-3 border transition-all duration-200 cursor-pointer"
                    >
                      <option value="createdAt">📅 Created Date</option>
                      <option value="dueDate">⏰ Due Date</option>
                      <option value="title">📝 Title</option>
                      <option value="priority">🔴 Priority</option>
                      <option value="status">📊 Status</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="direction-filter" className="block text-sm font-semibold text-gray-700 mb-2">
                      Sort Direction
                    </label>
                    <select
                      id="direction-filter"
                      value={filters.direction || 'desc'}
                      onChange={(e) => setFilters({ ...filters, direction: e.target.value as 'asc' | 'desc' })}
                      className="block w-full border-gray-200 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm px-4 py-3 border transition-all duration-200 cursor-pointer"
                    >
                      <option value="desc">⬇️ Descending</option>
                      <option value="asc">⬆️ Ascending</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
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
                  className="inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 transform hover:scale-105"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5 mt-6">
          <div className="bg-white/80 backdrop-blur-sm shadow-soft rounded-2xl border border-gray-100/50 overflow-hidden group hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
            <div className="px-6 py-6">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dt className="text-sm font-semibold text-gray-600 truncate">Total Tasks</dt>
                  <dd className="mt-1 text-3xl font-bold text-gray-900">{stats.total}</dd>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm shadow-soft rounded-2xl border border-gray-100/50 overflow-hidden group hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
            <div className="px-6 py-6">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dt className="text-sm font-semibold text-gray-600 truncate">Completed</dt>
                  <dd className="mt-1 text-3xl font-bold text-gray-900">{stats.completed}</dd>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm shadow-soft rounded-2xl border border-gray-100/50 overflow-hidden group hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
            <div className="px-6 py-6">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dt className="text-sm font-semibold text-gray-600 truncate">Pending</dt>
                  <dd className="mt-1 text-3xl font-bold text-gray-900">{stats.pending}</dd>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm shadow-soft rounded-2xl border border-gray-100/50 overflow-hidden group hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
            <div className="px-6 py-6">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dt className="text-sm font-semibold text-gray-600 truncate">In Progress</dt>
                  <dd className="mt-1 text-3xl font-bold text-gray-900">{stats.inProgress}</dd>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm shadow-soft rounded-2xl border border-gray-100/50 overflow-hidden group hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
            <div className="px-6 py-6">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-red-100 to-red-200 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dt className="text-sm font-semibold text-gray-600 truncate">Overdue</dt>
                  <dd className="mt-1 text-3xl font-bold text-gray-900">{stats.overdue}</dd>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Recent Tasks */}
        <div className="bg-white/80 backdrop-blur-sm shadow-soft rounded-2xl border border-gray-100/50 mt-6 overflow-hidden">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-gray-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Recent Tasks</h3>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="group inline-flex items-center px-4 py-2 border-0 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-colored-primary transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                New Task
              </button>
            </div>

          {recentTodos.length === 0 ? (
            <div className="text-center py-16">
              <div className="flex flex-col items-center">
                <div className="p-4 bg-gray-100 rounded-full mb-4">
                  <Calendar className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks yet</h3>
                <p className="text-sm text-gray-500 mb-6 max-w-md">
                  Get started by creating your first task item.
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center px-4 py-2 border-0 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-colored-primary transition-all duration-300 transform hover:scale-105"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Task
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTodos.map((todo, index) => (
                <div 
                  key={todo.id} 
                  className="group bg-white border border-gray-100 rounded-xl p-6 hover:shadow-medium transition-all duration-300 hover:border-primary-200 hover:-translate-y-1 animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getPriorityColor(todo.priority)}`}>
                        {todo.priority === 'HIGH' && '🔴'}{todo.priority === 'MEDIUM' && '🟡'}{todo.priority === 'LOW' && '🟢'} {todo.priority}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(todo.status)}`}>
                        {todo.status === 'COMPLETED' && '✅'}{todo.status === 'IN_PROGRESS' && '⚡'}{todo.status === 'PENDING' && '🔄'} {todo.status.replace('_', ' ')}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary-700 transition-colors duration-200">
                          {todo.title}
                        </h4>
                        {todo.description && (
                          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{todo.description}</p>
                        )}
                        {todo.dueDate && (
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            {format(new Date(todo.dueDate), 'MMM dd, yyyy')}
                          </div>
                        )}
                      </div>
                    </div>
                    {todo.completed && (
                      <div className="ml-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
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
                        defaultValue=""
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
    </div>
  );
};
