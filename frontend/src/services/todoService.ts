import api from './api';

export interface Todo {
  _id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  reminderDate?: string;
  createdAt: string;
  updatedAt: string;
}

export const todoService = {
  getTodos: async (): Promise<Todo[]> => {
    const response = await api.get('/todos');
    return response.data;
  },

  createTodo: async (todoData: Omit<Todo, '_id' | 'createdAt' | 'updatedAt'>): Promise<Todo> => {
    const response = await api.post('/todos', todoData);
    return response.data;
  },

  updateTodo: async (id: string, todoData: Partial<Todo>): Promise<Todo> => {
    const response = await api.put(`/todos/${id}`, todoData);
    return response.data;
  },

  deleteTodo: async (id: string): Promise<void> => {
    await api.delete(`/todos/${id}`);
  },
};