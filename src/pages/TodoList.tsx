import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store';
import { fetchTodos, createTodo, deleteTodo, patchTodo } from '../store/slices/todoSlice';
import { Plus, Edit2, Trash2, Calendar, CheckCircle, X } from 'lucide-react';
import { format } from 'date-fns';
import type { Todo, CreateTodoRequest, UpdateTodoRequest } from '../types/todo';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

export const TodoList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { todos, isLoading, filters } = useAppSelector((state) => state.todos);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTodoRequest>();

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchTodos({ ...filters, userId: user.id }));
    }
  }, [dispatch, filters, user?.id]);

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
    } catch (error: any) {
      toast.error(error.message || 'Failed to create task');
    }
  };

  const handleDeleteTodo = async (id: number) => {
    try {
      await dispatch(deleteTodo(id)).unwrap();
      toast.success('Task deleted successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete task');
    }
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setShowCreateForm(true);
  };

  const getChangedFields = (formData: Partial<UpdateTodoRequest>, originalTodo: Todo): Partial<UpdateTodoRequest> => {
    const changed: Partial<UpdateTodoRequest> = {};
    
    if (formData.title !== undefined && formData.title.trim() !== (originalTodo.title || '').trim()) {
      changed.title = formData.title;
    }
    
    const formDesc = formData.description?.trim() || undefined;
    const origDesc = originalTodo.description?.trim() || undefined;
    if (formData.description !== undefined && formDesc !== origDesc) {
      changed.description = formData.description;
    }
    
    if (formData.status !== undefined && formData.status !== originalTodo.status) {
      changed.status = formData.status;
      
      if (formData.status === 'COMPLETED') {
        changed.completed = true;
      } else if (originalTodo.status === 'COMPLETED') {
        changed.completed = false;
      }
    }
    
    if (formData.priority !== undefined && formData.priority !== originalTodo.priority) {
      changed.priority = formData.priority;
    }
    
    // Handle dueDate conversion from datetime-local to ISO
    if (formData.dueDate !== undefined) {
      const formDate = formData.dueDate.trim() || undefined;
      const formDateISO = formDate && formDate.length > 0 ? new Date(formDate).toISOString() : undefined;
      const origDate = originalTodo.dueDate?.trim() || undefined;
      
      if (formDateISO !== origDate) {
        changed.dueDate = formDateISO;
      }
    }
    
    return changed;
  };

  const handlePatchTodo = async (id: number, data: Partial<UpdateTodoRequest>) => {
    if (!editingTodo) return;
    
    try {
      const changedFields = getChangedFields(data, editingTodo);
      await dispatch(patchTodo({ id, todo: changedFields })).unwrap();
      toast.success('Task updated successfully!');
      setEditingTodo(null);
      setShowCreateForm(false);
      reset();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update task');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-700 bg-green-50 border-green-200 ring-green-500/20';
      case 'IN_PROGRESS':
        return 'text-blue-700 bg-blue-50 border-blue-200 ring-blue-500/20';
      case 'PENDING':
        return 'text-amber-700 bg-amber-50 border-amber-200 ring-amber-500/20';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200 ring-gray-500/20';
    }
  };

  const isOverdue = (todo: Todo): boolean => {
    if (!todo.dueDate || todo.completed) {
      return false;
    }
    try {
      const dueDate = new Date(todo.dueDate);
      const now = new Date();
      return dueDate.getTime() < now.getTime();
    } catch (e) {
      return false;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'text-red-700 bg-red-50 border-red-200 ring-red-500/20';
      case 'MEDIUM':
        return 'text-amber-700 bg-amber-50 border-amber-200 ring-amber-500/20';
      case 'LOW':
        return 'text-green-700 bg-green-50 border-green-200 ring-green-500/20';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200 ring-gray-500/20';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 rounded-full animate-pulse"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="mt-4 text-sm font-medium text-gray-600">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm shadow-soft rounded-2xl border border-gray-100/50 overflow-hidden">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-colored-primary">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">My Tasks</h3>
                  <p className="text-sm text-gray-500 mt-1">Manage your daily tasks efficiently</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCreateForm(true);
                  setEditingTodo(null);
                  reset();
                }}
                className="group inline-flex items-center px-6 py-3 border-0 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-colored-primary transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                New Task
              </button>
            </div>
          </div>
        </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white/90 backdrop-blur-sm shadow-medium rounded-2xl border border-gray-100/50 animate-slide-up mt-6 overflow-hidden">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingTodo ? 'Edit Task' : 'Create New Task'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingTodo(null);
                  reset();
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form className="space-y-6" onSubmit={handleSubmit(editingTodo ? (data) => handlePatchTodo(editingTodo.id, data) : handleCreateTodo)}>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                    Task Title <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      {...register('title', { required: 'Title is required' })}
                      type="text"
                      defaultValue={editingTodo?.title || ''}
                      className="block w-full appearance-none rounded-xl border border-gray-200 px-4 py-3 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200 peer"
                      placeholder="Enter task title..."
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <CheckCircle className="h-5 w-5 text-gray-400 peer-focus:text-primary-500 transition-colors duration-200" />
                    </div>
                  </div>
                  {errors.title && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <X className="h-4 w-4 mr-1" />
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    defaultValue={editingTodo?.description || ''}
                    className="block w-full appearance-none rounded-xl border border-gray-200 px-4 py-3 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200 resize-none"
                    placeholder="Add task description (optional)..."
                  />
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      {...register('status', { required: 'Status is required' })}
                      defaultValue={editingTodo?.status || 'PENDING'}
                      className="block w-full appearance-none rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200 cursor-pointer"
                    >
                      <option value="PENDING">🔄 Pending</option>
                      <option value="IN_PROGRESS">⚡ In Progress</option>
                      <option value="COMPLETED">✅ Completed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-semibold text-gray-700 mb-2">
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      {...register('priority', { required: 'Priority is required' })}
                      defaultValue={editingTodo?.priority || 'MEDIUM'}
                      className="block w-full appearance-none rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200 cursor-pointer"
                    >
                      <option value="LOW">🟢 Low</option>
                      <option value="MEDIUM">🟡 Medium</option>
                      <option value="HIGH">🔴 High</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="dueDate" className="block text-sm font-semibold text-gray-700 mb-2">
                    Due Date & Time
                  </label>
                  <div className="relative">
                    <input
                      {...register('dueDate')}
                      type="datetime-local"
                      defaultValue={editingTodo?.dueDate ? new Date(editingTodo.dueDate).toISOString().slice(0, 16) : ''}
                      className="block w-full appearance-none rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingTodo(null);
                    reset();
                  }}
                  className="px-6 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 border-0 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-colored-primary transition-all duration-300 transform hover:scale-105"
                >
                  {editingTodo ? '✏️ Update Task' : '➕ Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="bg-white/80 backdrop-blur-sm shadow-soft rounded-2xl border border-gray-100/50 mt-6 overflow-hidden">
        <div className="px-8 py-6">
          {todos.length === 0 ? (
            <div className="text-center py-16">
              <div className="flex flex-col items-center">
                <div className="p-4 bg-gray-100 rounded-full mb-4">
                  <CheckCircle className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks yet</h3>
                <p className="text-sm text-gray-500 mb-6 max-w-md">
                  Start organizing your day by creating your first task. Click the "New Task" button above to get started!
                </p>
                <button
                  onClick={() => {
                    setShowCreateForm(true);
                    setEditingTodo(null);
                    reset();
                  }}
                  className="inline-flex items-center px-4 py-2 border-0 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-colored-primary transition-all duration-300 transform hover:scale-105"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Task
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {todos.map((todo, index) => {
                const overdue = isOverdue(todo);
                return (
                <div 
                  key={todo.id} 
                  className={`group rounded-xl p-6 hover:shadow-medium transition-all duration-300 hover:-translate-y-1 animate-slide-up ${
                    overdue 
                      ? 'bg-red-50 border-2 border-red-300 hover:border-red-400' 
                      : 'bg-white border border-gray-100 hover:border-primary-200'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getPriorityColor(todo.priority)}`}>
                          {todo.priority === 'HIGH' && '🔴'}{todo.priority === 'MEDIUM' && '🟡'}{todo.priority === 'LOW' && '🟢'} {todo.priority}
                        </span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(todo.status)}`}>
                          {todo.status === 'COMPLETED' && '✅'}{todo.status === 'IN_PROGRESS' && '⚡'}{todo.status === 'PENDING' && '🔄'} {todo.status.replace('_', ' ')}
                        </span>
                        {todo.completed && (
                          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold text-green-700 bg-green-100 border border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Done
                          </div>
                        )}
                        {todo.dueDate && String(todo.dueDate).trim() !== '' && (
                          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200">
                            <Calendar className="h-3 w-3 mr-1.5" />
                            {(() => {
                              try {
                                const date = new Date(todo.dueDate);
                                if (isNaN(date.getTime())) return 'Invalid date';
                                return format(date, 'MMM dd, yyyy');
                              } catch (e) {
                                return 'Invalid date';
                              }
                            })()}
                          </div>
                        )}
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors duration-200">
                        {todo.title}
                      </h4>
                      {todo.dueDate && String(todo.dueDate).trim() !== '' && (
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="font-medium">Due:</span>
                          <span className="ml-1">
                            {(() => {
                              try {
                                const date = new Date(todo.dueDate);
                                if (isNaN(date.getTime())) return 'Invalid date';
                                return format(date, 'MMM dd, yyyy at HH:mm');
                              } catch (e) {
                                return 'Invalid date';
                              }
                            })()}
                          </span>
                        </div>
                      )}
                      {todo.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{todo.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => handleEditTodo(todo)}
                        className="p-2.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-110"
                        title="Edit task"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="p-2.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 transform hover:scale-110"
                        title="Delete task"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};
