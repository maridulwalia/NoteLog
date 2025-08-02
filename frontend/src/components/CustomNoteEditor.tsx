import React, { useState, useEffect } from 'react';
import { Save, X, Calendar, Clock } from 'lucide-react';
import { CustomNote } from '../services/customNoteService';

interface BackgroundImage {
  url: string;
  title: string;
}

interface CustomNoteEditorProps {
  backgroundImage: BackgroundImage;
  existingNote: CustomNote | null;
  onSave: (noteData: any) => void;
  onCancel: () => void;
}

const CustomNoteEditor: React.FC<CustomNoteEditorProps> = ({ 
  backgroundImage, 
  existingNote, 
  onSave, 
  onCancel 
}) => {
  const [noteData, setNoteData] = useState({
    title: '',
    content: ''
  });
  const [isDraft, setIsDraft] = useState(false);

  useEffect(() => {
    if (existingNote) {
      setNoteData({
        title: existingNote.title,
        content: existingNote.content || ''
      });
    } else {
      // Load draft from localStorage if exists
      const draftKey = `note-draft-${backgroundImage.url}`;
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        setNoteData(draft);
        setIsDraft(true);
      }
    }
  }, [existingNote, backgroundImage.url]);

  useEffect(() => {
    // Auto-save draft to localStorage
    if (!existingNote && (noteData.title || noteData.content)) {
      const draftKey = `note-draft-${backgroundImage.url}`;
      localStorage.setItem(draftKey, JSON.stringify(noteData));
      setIsDraft(true);
    }
  }, [noteData, existingNote, backgroundImage.url]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteData.title.trim()) return;

    const noteToSave = {
      ...noteData,
      backgroundImageUrl: backgroundImage.url
    };

    onSave(noteToSave);

    // Clear draft after saving
    if (!existingNote) {
      const draftKey = `note-draft-${backgroundImage.url}`;
      localStorage.removeItem(draftKey);
    }
  };

  const handleCancel = () => {
    // Clear draft when canceling
    if (!existingNote) {
      const draftKey = `note-draft-${backgroundImage.url}`;
      localStorage.removeItem(draftKey);
    }
    onCancel();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNoteData({
      ...noteData,
      [e.target.name]: e.target.value
    });
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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {existingNote ? 'Edit Note' : 'Create Note'}
            </h2>
            {isDraft && !existingNote && (
              <p className="text-sm text-amber-600 mt-1 flex items-center gap-1">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                Draft saved locally
              </p>
            )}
          </div>
          <button
          title='Cancel'
            onClick={handleCancel}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-all duration-200 hover:scale-110"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Background Preview */}
          <div className="lg:w-1/2 p-6 border-r border-slate-200">
            <div className="relative rounded-xl overflow-hidden mb-6 shadow-lg">
              <img
                src={backgroundImage.url}
                alt={backgroundImage.title}
                className="w-full h-72 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-center justify-center">
                <div className="text-white text-center">
                  <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">
                    {noteData.title || 'Untitled Note'}
                  </h3>
                  <p className="text-sm opacity-90 drop-shadow">
                    Background: {backgroundImage.title}
                  </p>
                </div>
              </div>
            </div>

            {existingNote && (
              <div className="bg-slate-50/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200">
                <h4 className="font-semibold text-slate-800 mb-3">Note Information</h4>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>Created: {formatDate(existingNote.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span>Updated: {formatDate(existingNote.updatedAt)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Note Form */}
          <div className="lg:w-1/2 p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={noteData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter note title"
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-slate-700 mb-2">
                  Content
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={noteData.content}
                  onChange={handleChange}
                  rows={12}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                  placeholder="Write your note content here..."
                />
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <Save size={16} />
                  {existingNote ? 'Update Note' : 'Save Note'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-slate-500 hover:bg-slate-600 text-white px-4 py-3 rounded-xl transition-all duration-200 transform hover:scale-105"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomNoteEditor;