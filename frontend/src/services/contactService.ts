import api from './api';

export interface Contact {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  tag: 'family' | 'friend' | 'work' | 'other';
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export const contactService = {
  getContacts: async (): Promise<Contact[]> => {
    const response = await api.get('/contacts');
    return response.data;
  },

  createContact: async (contactData: Omit<Contact, '_id' | 'createdAt' | 'updatedAt'>): Promise<Contact> => {
    const response = await api.post('/contacts', contactData);
    return response.data;
  },

  updateContact: async (id: string, contactData: Partial<Contact>): Promise<Contact> => {
    const response = await api.put(`/contacts/${id}`, contactData);
    return response.data;
  },

  deleteContact: async (id: string): Promise<void> => {
    await api.delete(`/contacts/${id}`);
  },
};