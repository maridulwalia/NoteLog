import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, Plus, Calendar, Edit, Trash2, Bell } from 'lucide-react';
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Todos</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Add Todo
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {showForm && (
          <TodoForm
            todo={editingTodo}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
          />
        )}

        <div className="space-y-4">
          {todos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No todos yet. Create your first todo!
            </div>
          ) : (
            todos.map((todo) => (
              <div
                key={todo._id}
                className={`bg-gray-50 rounded-lg p-4 border-l-4 transition-all duration-300 hover:shadow-md ${
                  todo.isCompleted
                    ? 'border-green-400 bg-green-50 opacity-75'
                    : 'border-blue-400'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      onClick={() => handleToggleComplete(todo._id, todo.isCompleted)}
                      className={`mt-1 transition-colors duration-200 ${
                        todo.isCompleted ? 'text-green-600' : 'text-gray-400 hover:text-green-600'
                      }`}
                    >
                      {todo.isCompleted ? <CheckCircle size={20} /> : <Circle size={20} />}
                    </button>
                    <div className="flex-1">
                      <h3
                        className={`font-semibold text-lg transition-all duration-300 ${
                          todo.isCompleted
                            ? 'text-gray-500 line-through'
                            : 'text-gray-800'
                        }`}
                      >
                        {todo.title}
                      </h3>
                      {todo.description && (
                        <p
                          className={`text-gray-600 mt-1 transition-all duration-300 ${
                            todo.isCompleted ? 'line-through opacity-75' : ''
                          }`}
                        >
                          {todo.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>Created: {formatDate(todo.createdAt)}</span>
                        {todo.reminderDate && (
                          <span className="flex items-center gap-1">
                            <Bell size={14} />
                            Reminder: {formatDate(todo.reminderDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(todo)}
                      className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(todo._id)}
                      className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-100 transition-colors"
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
  );
};

export default TodoList;