import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, Loader2 } from 'lucide-react';
import { Note } from '../types';
import { notesAPI } from '../utils/api';
import NoteItem from './NoteItem';

interface NotesListProps {
  onError: (error: string) => void;
}

const NotesList: React.FC<NotesListProps> = ({ onError }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    const filtered = notes.filter(note =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredNotes(filtered);
  }, [notes, searchTerm]);

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const fetchedNotes = await notesAPI.getAll();
      setNotes(fetchedNotes);
    } catch (error) {
      onError('Failed to fetch notes. Please try again.');
      console.error('Error fetching notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNote = () => {
    const newNote: Note = {
      id: `draft-${Date.now()}`,
      title: '',
      content: '',
      isDraft: true,
    };
    setNotes(prev => [newNote, ...prev]);
  };

  const handleUpdateNote = async (oldId: string, updatedNote: Note) => {
    if (oldId.startsWith('draft-')) {
      setNotes(prev =>
        prev.map(note => (note.id === oldId ? updatedNote : note))
      );
      return;
    }

    try {
      setIsUpdating(true);
      const savedNote = await notesAPI.update(updatedNote.id, {
        title: updatedNote.title,
        content: updatedNote.content,
      });
      setNotes(prev =>
        prev.map(note => (note.id === oldId ? savedNote : note))
      );
    } catch (error) {
      onError('Failed to update note. Please try again.');
      console.error('Error updating note:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (id.startsWith('draft-')) {
      setNotes(prev => prev.filter(note => note.id !== id));
      return;
    }

    try {
      await notesAPI.delete(id);
      setNotes(prev => prev.filter(note => note.id !== id));
    } catch (error) {
      onError('Failed to delete note. Please try again.');
      console.error('Error deleting note:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading your notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">My Notes</h1>
              <p className="text-slate-600">
                {notes.length} {notes.length === 1 ? 'note' : 'notes'} total
              </p>
            </div>
            <button
              onClick={handleCreateNote}
              disabled={isCreating}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  <span>New Note</span>
                </>
              )}
            </button>
          </div>

          <div className="relative max-w-md mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/60 backdrop-blur-sm"
            />
          </div>

          {filteredNotes.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                {searchTerm ? 'No notes found' : 'No notes yet'}
              </h3>
              <p className="text-slate-600 mb-6">
                {searchTerm
                  ? 'Try adjusting your search terms.'
                  : 'Create your first note to get started.'}
              </p>
              {!searchTerm && (
                <button
                  onClick={handleCreateNote}
                  disabled={isCreating}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl mx-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5" />
                      <span>Create First Note</span>
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredNotes.map((note) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  onUpdate={handleUpdateNote}
                  onDelete={handleDeleteNote}
                  isUpdating={isUpdating}
                />
              ))}
            </div>
          )}
        </div>
      {/* </div> */}
    </div>
  );
};

export default NotesList;