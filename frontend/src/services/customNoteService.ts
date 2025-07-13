import api from './api';

export interface CustomNote {
  _id: string;
  title: string;
  content?: string;
  backgroundImageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export const customNoteService = {
  getCustomNotes: async (): Promise<CustomNote[]> => {
    const response = await api.get('/custom-notes');
    return response.data;
  },

  createCustomNote: async (noteData: Omit<CustomNote, '_id' | 'createdAt' | 'updatedAt'>): Promise<CustomNote> => {
    const response = await api.post('/custom-notes', noteData);
    return response.data;
  },

  updateCustomNote: async (id: string, noteData: Partial<CustomNote>): Promise<CustomNote> => {
    const response = await api.put(`/custom-notes/${id}`, noteData);
    return response.data;
  },

  deleteCustomNote: async (id: string): Promise<void> => {
    await api.delete(`/custom-notes/${id}`);
  },
};