import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, Clock, StickyNote } from 'lucide-react';
import { customNoteService, CustomNote } from '../services/customNoteService';
import BackgroundGallery from './BackgroundGallery';
import CustomNoteEditor from './CustomNoteEditor';

interface BackgroundImage {
  url: string;
  title: string;
}

const CustomNotesGallery: React.FC = () => {
  const [notes, setNotes] = useState<CustomNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBackgroundGallery, setShowBackgroundGallery] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState<CustomNote | null>(null);
  const [selectedBackground, setSelectedBackground] = useState<BackgroundImage | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const data = await customNoteService.getCustomNotes();
      setNotes(data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  const handleBackgroundSelect = (background: BackgroundImage) => {
    setSelectedBackground(background);
    setShowBackgroundGallery(false);
    setShowEditor(true);
  };

  const handleSaveNote = async (noteData: any) => {
    try {
      if (editingNote) {
        const updatedNote = await customNoteService.updateCustomNote(editingNote._id, noteData);
        setNotes(notes.map(note => 
          note._id === editingNote._id ? updatedNote : note
        ));
      } else {
        const newNote = await customNoteService.createCustomNote(noteData);
        setNotes([newNote, ...notes]);
      }
      setShowEditor(false);
      setEditingNote(null);
      setSelectedBackground(null);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to save note');
    }
  };

  const handleEditNote = (note: CustomNote) => {
    setEditingNote(note);
    setSelectedBackground({ url: note.backgroundImageUrl, title: 'Selected Background' });
    setShowEditor(true);
  };

  const handleDeleteNote = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await customNoteService.deleteCustomNote(id);
        setNotes(notes.filter(note => note._id !== id));
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to delete note');
      }
    }
  };

  const handleCancel = () => {
    setShowEditor(false);
    setShowBackgroundGallery(false);
    setEditingNote(null);
    setSelectedBackground(null);
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
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <StickyNote size={32} />
            Custom Notes
          </h1>
          <button
            onClick={() => setShowBackgroundGallery(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Create Note
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {showBackgroundGallery && (
          <BackgroundGallery
            onSelectBackground={handleBackgroundSelect}
            onClose={handleCancel}
          />
        )}

        {showEditor && selectedBackground && (
          <CustomNoteEditor
            backgroundImage={selectedBackground}
            existingNote={editingNote}
            onSave={handleSaveNote}
            onCancel={handleCancel}
          />
        )}

        {/* Notes Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              <StickyNote size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg">No notes yet. Create your first custom note!</p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="relative h-48">
                  <img
                    src={note.backgroundImageUrl}
                    alt="Note background"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="text-white text-center p-4">
                      <h3 className="text-xl font-bold mb-2 truncate">
                        {note.title}
                      </h3>
                      {note.content && (
                        <p className="text-sm opacity-90 line-clamp-3">
                          {note.content}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={() => handleEditNote(note)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note._id)}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="p-4 bg-gray-50">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{formatDate(note.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{formatDate(note.updatedAt)}</span>
                    </div>
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

export default CustomNotesGallery;