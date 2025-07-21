import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Edit3, Check, X, Clock } from 'lucide-react';
import { Note } from '../types';
import { notesAPI } from '../utils/api';

interface NoteItemProps {
  note: Note;
  onUpdate: (oldId: string, updatedNote: Note) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isUpdating: boolean;
}

const NoteItem: React.FC<NoteItemProps> = ({ note, onUpdate, onDelete, isUpdating }) => {
  const [isEditing, setIsEditing] = useState(note.isDraft ?? false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content);
  const [isDeleting, setIsDeleting] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const handleSave = async () => {
    const trimmedTitle = editTitle.trim() || 'Untitled';
    const trimmedContent = editContent.trim();

    if (!trimmedTitle && !trimmedContent) return;

    try {
      if (note.id.startsWith('draft-')) {
        const createdNote = await notesAPI.create({
          title: trimmedTitle,
          content: trimmedContent,
        });

        // Replace the draft with the created note
        await onUpdate(note.id, { ...createdNote });
      } else {
        const updatedNote: Note = {
          ...note,
          title: trimmedTitle,
          content: trimmedContent,
        };

        await onUpdate(note.id, updatedNote);
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const handleDelete = async () => {
    if (!note?.id) {
      console.error('Note id is missing!');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete this note?');
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await onDelete(note.id);
    } catch (error) {
      console.error('Delete error:', error);
      setIsDeleting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? 'Not saved yet'
      : date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
  };

  return (
    <div
      className={`bg-white/60 backdrop-blur-sm rounded-xl border p-6 transition-all duration-300 hover:shadow-lg hover:bg-white/80 ${
        isDeleting ? 'opacity-50 scale-95' : ''
      } ${note.isDraft ? 'border-dashed border-blue-400 bg-blue-50/50' : 'border-white/20 shadow-sm'}`}
    >
      {isEditing ? (
        <div className="space-y-4">
          <input
            ref={titleInputRef}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full text-xl font-semibold border-none outline-none bg-slate-50/80 p-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            placeholder="Note title..."
          />
          <textarea
            ref={contentTextareaRef}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={6}
            className="w-full border-none outline-none bg-slate-50/80 p-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 resize-none transition-all duration-200"
            placeholder="Write your note here..."
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="flex items-center gap-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 shadow-sm"
              >
                <Check className="h-4 w-4" />
                <span>Save</span>
              </button>
              <button
                onClick={handleCancel}
                disabled={isUpdating}
                className="flex items-center gap-1 px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 shadow-sm"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
            </div>
            <p className="text-xs text-slate-500 font-medium">Ctrl+Enter to save, Esc to cancel</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xl font-semibold text-slate-800 flex-1 leading-tight">
              {note.title || 'Untitled'}
            </h3>
            <div className="flex items-center gap-1 ml-4">
              <button
                onClick={handleEdit}
                className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 hover:scale-110"
                title="Edit note"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all duration-200 hover:scale-110 disabled:opacity-50"
                title="Delete note"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
              {note.content || 'No content'}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Created: {formatDate(note.createdAt)}</span>
            </div>
            {note.updatedAt !== note.createdAt && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Updated: {formatDate(note.updatedAt)}</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NoteItem;