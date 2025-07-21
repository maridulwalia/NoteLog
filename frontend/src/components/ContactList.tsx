import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Phone, Mail, MapPin, Users } from 'lucide-react';
import { contactService, Contact } from '../services/contactService';
import ContactForm from './ContactForm';

const ContactList: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [error, setError] = useState('');

  const tags = [
    { value: 'all', label: 'All Contacts', color: 'bg-gray-500' },
    { value: 'family', label: 'Family', color: 'bg-green-500' },
    { value: 'friend', label: 'Friend', color: 'bg-blue-500' },
    { value: 'work', label: 'Work', color: 'bg-purple-500' },
    { value: 'other', label: 'Other', color: 'bg-orange-500' }
  ];

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    filterContacts();
  }, [contacts, searchTerm, selectedTag]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const data = await contactService.getContacts();
      setContacts(data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  const filterContacts = () => {
    let filtered = contacts;

    if (searchTerm) {
      filtered = filtered.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.includes(searchTerm) ||
        contact.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedTag !== 'all') {
      filtered = filtered.filter(contact => contact.tag === selectedTag);
    }

    setFilteredContacts(filtered);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await contactService.deleteContact(id);
        setContacts(contacts.filter(contact => contact._id !== id));
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to delete contact');
      }
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setShowForm(true);
  };

  const handleFormSubmit = async (contactData: Contact) => {
    try {
      if (editingContact) {
        const updatedContact = await contactService.updateContact(editingContact._id, contactData);
        setContacts(contacts.map(contact => 
          contact._id === editingContact._id ? updatedContact : contact
        ));
      } else {
        const newContact = await contactService.createContact(contactData);
        setContacts([newContact, ...contacts]);
      }
      setShowForm(false);
      setEditingContact(null);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to save contact');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingContact(null);
  };

  const getTagColor = (tag: string) => {
    const tagObj = tags.find(t => t.value === tag);
    return tagObj ? tagObj.color : 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading your contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Contacts</h1>
              <p className="text-slate-600">
                {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'} total
              </p>
            </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            Add Contact
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>{error}</span>
          </div>
        )}

        {showForm && (
          <ContactForm
            contact={editingContact}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
          />
        )}

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/60 backdrop-blur-sm"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {tags.map(tag => (
              <button
                key={tag.value}
                onClick={() => setSelectedTag(tag.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                  selectedTag === tag.value
                    ? `${tag.color} text-white`
                    : 'bg-white/60 text-slate-700 hover:bg-white/80 border border-slate-200'
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contacts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                {searchTerm || selectedTag !== 'all' ? 'No contacts found' : 'No contacts yet'}
              </h3>
              <p className="text-slate-600 mb-6">
                {searchTerm || selectedTag !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'Add your first contact to get started.'}
              </p>
              {!searchTerm && selectedTag === 'all' && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl mx-auto"
                >
                  <Plus size={20} />
                  Add First Contact
                </button>
              )}
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <div
                key={contact._id}
                className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:shadow-lg hover:bg-white/80 transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-slate-800">{contact.name}</h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs text-white font-medium ${getTagColor(contact.tag)}`}>
                        {contact.tag}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                    title= "Edit Cointact"
                      onClick={() => handleEdit(contact)}
                      className="text-slate-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200 hover:scale-110"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                    title= "Delete Contact"
                      onClick={() => handleDelete(contact._id)}
                      className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all duration-200 hover:scale-110"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone size={14} />
                    <span>{contact.phone}</span>
                  </div>
                  {contact.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={14} />
                      <span>{contact.email}</span>
                    </div>
                  )}
                  {contact.address && (
                    <div className="flex items-center gap-2">
                      <MapPin size={14} />
                      <span className="line-clamp-2">{contact.address}</span>
                    </div>
                  )}
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

export default ContactList;