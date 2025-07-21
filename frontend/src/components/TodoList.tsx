import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, Plus, Calendar, Edit, Trash2, Bell, Clock } from 'lucide-react';
import { todoService, Todo } from '../services/todoService';
import TodoForm from './TodoForm';

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTodos();
    checkReminders();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const data = await todoService.getTodos();
      setTodos(data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch todos');
    } finally {
      setLoading(false);
    }
  };

  const checkReminders = () => {
    const checkInterval = setInterval(() => {
      todos.forEach(todo => {
        if (todo.reminderDate && !todo.isCompleted) {
          const reminderTime = new Date(todo.reminderDate).getTime();
          const now = new Date().getTime();
          
          if (reminderTime <= now && reminderTime > now - 60000) { // Within last minute
            if (Notification.permission === 'granted') {
              new Notification('Todo Reminder', {
                body: `Reminder: ${todo.title}`,
                icon: '/favicon.ico'
              });
            }
          }
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(checkInterval);
  };

  useEffect(() => {
    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleToggleComplete = async (id: string, isCompleted: boolean) => {
    try {
      const updatedTodo = await todoService.updateTodo(id, { isCompleted: !isCompleted });
      setTodos(todos.map(todo => 
        todo._id === id ? updatedTodo : todo
      ));
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update todo');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      try {
        await todoService.deleteTodo(id);
        setTodos(todos.filter(todo => todo._id !== id));
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to delete todo');
      }
    }
  };

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setShowForm(true);
  };

  const handleFormSubmit = async (todoData: any) => {
    try {
      if (editingTodo) {
        const updatedTodo = await todoService.updateTodo(editingTodo._id, todoData);
        setTodos(todos.map(todo => 
          todo._id === editingTodo._id ? updatedTodo : todo
        ));
      } else {
        const newTodo = await todoService.createTodo(todoData);
        setTodos([newTodo, ...todos]);
      }
      setShowForm(false);
      setEditingTodo(null);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to save todo');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTodo(null);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading your todos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">My Todos</h1>
              <p className="text-slate-600">
                {todos.length} {todos.length === 1 ? 'task' : 'tasks'} total
              </p>
            </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            New Task
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>{error}</span>
          </div>
        )}

        {showForm && (
          <TodoForm
            todo={editingTodo}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
          />
        )}

        <div className="space-y-3">
          {todos.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No tasks yet</h3>
              <p className="text-slate-600 mb-6">Create your first task to get started</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl mx-auto"
              >
                <Plus size={20} />
                Create First Task
              </button>
            </div>
          ) : (
            todos.map((todo) => (
              <div
                key={todo._id}
                className={`bg-white/60 backdrop-blur-sm rounded-xl p-5 border-l-4 transition-all duration-300 hover:shadow-lg hover:bg-white/80 ${
                  todo.isCompleted
                    ? 'border-emerald-400 bg-emerald-50/50'
                    : 'border-blue-400 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      onClick={() => handleToggleComplete(todo._id, todo.isCompleted)}
                      className={`mt-1 transition-all duration-200 hover:scale-110 ${
                        todo.isCompleted ? 'text-emerald-500' : 'text-slate-400 hover:text-emerald-500'
                      }`}
                    >
                      {todo.isCompleted ? <CheckCircle size={20} /> : <Circle size={20} />}
                    </button>
                    <div className="flex-1">
                      <h3
                        className={`font-semibold text-lg transition-all duration-300 ${
                          todo.isCompleted
                            ? 'text-slate-500 line-through'
                            : 'text-slate-800'
                        }`}
                      >
                        {todo.title}
                      </h3>
                      {todo.description && (
                        <p
                          className={`text-gray-600 mt-1 transition-all duration-300 ${
                            todo.isCompleted ? 'line-through opacity-60' : ''
                          }`}
                        >
                          {todo.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>{formatDate(todo.createdAt)}</span>
                        </div>
                        {todo.reminderDate && (
                          <div className="flex items-center gap-1 text-amber-600">
                            <Bell size={14} />
                            <span>{formatDate(todo.reminderDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(todo)}
                      className="text-slate-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200 hover:scale-110"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(todo._id)}
                      className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all duration-200 hover:scale-110"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default TodoList;