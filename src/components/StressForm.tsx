import React, { useState, useEffect } from 'react';
import { StressLog } from '../types';
import { formatTimestampForInput, parseInputTimestamp } from '../utils/dateUtils'; // Import helpers
import { BrainCircuit, Gauge, StickyNote, Save, XCircle, Trash2, CalendarClock } from 'lucide-react'; // Added CalendarClock

type StressFormData = Omit<StressLog, 'type'>;

interface StressFormProps {
  onSave: (data: StressFormData) => void;
  initialData?: StressLog | null;
  onCancel?: () => void;
  onDelete?: (id: string) => void;
}

const stressLevels = [0, 1, 2, 3, 4, 5];

const StressForm: React.FC<StressFormProps> = ({ onSave, initialData = null, onCancel, onDelete }) => {
  const [level, setLevel] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [editedDateTime, setEditedDateTime] = useState<string>(''); // State for date/time input

  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      setLevel(initialData.level);
      setNotes(initialData.notes ?? '');
      // Format the initial timestamp for the input field
      setEditedDateTime(formatTimestampForInput(initialData.timestamp));
    } else {
      setLevel(0);
      setNotes('');
      setEditedDateTime(''); // Clear date/time for new entry
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let timestampToSave: number;
    if (isEditing) {
      timestampToSave = parseInputTimestamp(editedDateTime);
      if (isNaN(timestampToSave)) {
        alert("Invalid date and time selected. Please check the format.");
        return; // Prevent saving with invalid date
      }
    } else {
      timestampToSave = initialData?.timestamp || 0; // Handled by App.tsx for new entries
    }

    const dataToSave: StressFormData = {
      id: initialData?.id || '', // Keep original ID if editing
      timestamp: timestampToSave, // Use parsed timestamp if editing
      level: level,
      notes: notes.trim() || undefined,
    };
    onSave(dataToSave);
  };

  const handleDelete = () => {
    if (initialData && onDelete) {
      if (window.confirm('Are you sure you want to delete this stress log entry?')) {
        onDelete(initialData.id);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-700">
        <BrainCircuit className="w-6 h-6 mr-2 text-purple-500" />
        {isEditing ? 'Edit Stress Log' : 'Log Daily Stress Level'}
      </h2>

      {/* Date Time Input - Only show when editing */}
      {isEditing && (
        <div className="space-y-2">
          <label htmlFor="entryDateTimeStress" className="block text-sm font-medium text-gray-700 flex items-center">
            <CalendarClock className="w-4 h-4 mr-1 text-gray-500" /> Date & Time
          </label>
          <input
            type="datetime-local"
            id="entryDateTimeStress"
            value={editedDateTime}
            onChange={(e) => setEditedDateTime(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            required
          />
        </div>
      )}

      {/* Stress Level */}
      <div className="space-y-2">
        <label htmlFor="stressLevel" className="block text-sm font-medium text-gray-700 flex items-center">
          <Gauge className="w-4 h-4 mr-1 text-gray-500" /> Stress Level (0-5)
        </label>
        <select
          id="stressLevel"
          value={level}
          onChange={(e) => setLevel(parseInt(e.target.value))}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          {stressLevels.map(lvl => (
            <option key={lvl} value={lvl}>{lvl === 0 ? '0 - Low' : lvl === 5 ? '5 - High' : lvl}</option>
          ))}
        </select>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label htmlFor="stressNotes" className="block text-sm font-medium text-gray-700 flex items-center">
          <StickyNote className="w-4 h-4 mr-1 text-gray-500" /> Notes (Optional)
        </label>
        <textarea
          id="stressNotes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
          placeholder="Any contributing factors or feelings..."
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-3 pt-2">
        {isEditing && onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <Trash2 className="w-5 h-5 mr-2 -ml-1" />
            Delete
          </button>
        )}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <XCircle className="w-5 h-5 mr-2 -ml-1" />
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Save className="w-5 h-5 mr-2 -ml-1" />
          {isEditing ? 'Update Entry' : 'Save Stress Level'}
        </button>
      </div>
    </form>
  );
};

export default StressForm;
