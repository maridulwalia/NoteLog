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
      className={`bg-white rounded-lg shadow-sm border p-6 transition-all duration-200 hover:shadow-md ${
        isDeleting ? 'opacity-50 scale-95' : ''
      } ${note.isDraft ? 'border-dashed border-blue-400' : 'border-gray-200'}`}
    >
      {isEditing ? (
        <div className="space-y-4">
          <input
            ref={titleInputRef}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full text-xl font-semibold border-none outline-none bg-gray-50 p-2 rounded focus:bg-white focus:ring-2 focus:ring-blue-500"
            placeholder="Note title..."
          />
          <textarea
            ref={contentTextareaRef}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={6}
            className="w-full border-none outline-none bg-gray-50 p-2 rounded focus:bg-white focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Write your note here..."
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                <span>Save</span>
              </button>
              <button
                onClick={handleCancel}
                disabled={isUpdating}
                className="flex items-center space-x-1 px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
            </div>
            <p className="text-xs text-gray-500">Ctrl+Enter to save, Esc to cancel</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900 flex-1">
              {note.title || 'Untitled'}
            </h3>
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={handleEdit}
                className="p-1 text-gray-400 hover:text-blue-500"
                title="Edit note"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-50"
                title="Delete note"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {note.content || 'No content'}
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>Created: {formatDate(note.createdAt)}</span>
            </div>
            {note.updatedAt !== note.createdAt && (
              <div className="flex items-center space-x-1">
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