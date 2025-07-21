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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading your notes...</p>
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
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3 mb-2">
            <StickyNote size={32} />
            Custom Notes
          </h1>
              <p className="text-slate-600">
                {notes.length} {notes.length === 1 ? 'note' : 'notes'} total
              </p>
            </div>
          <button
            onClick={() => setShowBackgroundGallery(true)}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            Create Note
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>{error}</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {notes.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <StickyNote className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No notes yet</h3>
              <p className="text-slate-600 mb-6">Create your first custom note with a beautiful background</p>
              <button
                onClick={() => setShowBackgroundGallery(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl mx-auto"
              >
                <Plus size={20} />
                Create First Note
              </button>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note._id}
                className="bg-white/60 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:scale-105 border border-white/20"
              >
                <div className="relative h-52">
                  <img
                    src={note.backgroundImageUrl}
                    alt="Note background"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-center justify-center">
                    <div className="text-white text-center p-4">
                      <h3 className="text-xl font-bold mb-2 line-clamp-2 drop-shadow-lg">
                        {note.title}
                      </h3>
                      {note.content && (
                        <p className="text-sm opacity-90 line-clamp-3 drop-shadow">
                          {note.content}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={() => handleEditNote(note)}
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 rounded-full transition-all duration-200 hover:scale-110 shadow-lg"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note._id)}
                      className="bg-white/20 backdrop-blur-sm hover:bg-red-500/80 text-white p-2 rounded-full transition-all duration-200 hover:scale-110 shadow-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-4 bg-white/40 backdrop-blur-sm">
                  <div className="flex items-center justify-between text-sm text-slate-600">
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
    </div>
  );
};

export default CustomNotesGallery;