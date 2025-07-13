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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {existingNote ? 'Edit Note' : 'Create Note'}
            </h2>
            {isDraft && !existingNote && (
              <p className="text-sm text-amber-600 mt-1">Draft saved locally</p>
            )}
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Background Preview */}
          <div className="lg:w-1/2 p-6">
            <div className="relative rounded-lg overflow-hidden mb-4">
              <img
                src={backgroundImage.url}
                alt={backgroundImage.title}
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                <div className="text-white text-center">
                  <h3 className="text-xl font-bold mb-2">
                    {noteData.title || 'Untitled Note'}
                  </h3>
                  <p className="text-sm opacity-90">
                    Background: {backgroundImage.title}
                  </p>
                </div>
              </div>
            </div>

            {existingNote && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Note Info</h4>
                <div className="space-y-2 text-sm text-gray-600">
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
          <div className="lg:w-1/2 p-6 border-l">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={noteData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter note title"
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={noteData.content}
                  onChange={handleChange}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Write your note content here..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Save size={16} />
                  {existingNote ? 'Update Note' : 'Save Note'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
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