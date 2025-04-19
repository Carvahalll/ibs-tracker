import React, { useState, useEffect } from 'react';
import { SymptomLog, BristolStoolType } from '../types';
import { formatTimestampForInput, parseInputTimestamp } from '../utils/dateUtils';
import { Stethoscope, Scale, Droplet, Wind, AlertTriangle, StickyNote, Save, XCircle, Trash2, CalendarClock } from 'lucide-react';

type SymptomFormData = Omit<SymptomLog, 'type'>;

interface SymptomFormProps {
  onSave: (data: SymptomFormData) => void;
  initialData?: SymptomLog | null;
  onCancel?: () => void;
  onDelete?: (id: string) => void;
}

// Define descriptive labels for Bristol Scale types
const bristolScaleDescriptions: Record<BristolStoolType, string> = {
  type1: 'Type 1 - Separate hard lumps, like nuts (hard to pass)',
  type2: 'Type 2 - Sausage-shaped, but lumpy',
  type3: 'Type 3 - Like a sausage but with cracks on its surface',
  type4: 'Type 4 - Like a sausage or snake, smooth and soft',
  type5: 'Type 5 - Soft blobs with clear-cut edges (passed easily)',
  type6: 'Type 6 - Fluffy pieces with ragged edges, a mushy stool',
  type7: 'Type 7 - Watery, no solid pieces (entirely liquid)',
};

// Get the keys for iteration
const bristolTypes = Object.keys(bristolScaleDescriptions) as BristolStoolType[];

const severityLevels = [0, 1, 2, 3, 4, 5];

const SymptomForm: React.FC<SymptomFormProps> = ({ onSave, initialData = null, onCancel, onDelete }) => {
  const [bowelMovement, setBowelMovement] = useState<BristolStoolType | undefined>(undefined);
  const [crampsSeverity, setCrampsSeverity] = useState<number>(0);
  const [bloatingSeverity, setBloatingSeverity] = useState<number>(0);
  const [urgency, setUrgency] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [editedDateTime, setEditedDateTime] = useState<string>('');

  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      setBowelMovement(initialData.bowelMovement);
      setCrampsSeverity(initialData.crampsSeverity ?? 0);
      setBloatingSeverity(initialData.bloatingSeverity ?? 0);
      setUrgency(initialData.urgency ?? false);
      setNotes(initialData.notes ?? '');
      setEditedDateTime(formatTimestampForInput(initialData.timestamp));
    } else {
      setBowelMovement(undefined);
      setCrampsSeverity(0);
      setBloatingSeverity(0);
      setUrgency(false);
      setNotes('');
      setEditedDateTime('');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let timestampToSave: number;
    if (isEditing) {
      timestampToSave = parseInputTimestamp(editedDateTime);
      if (isNaN(timestampToSave)) {
        alert("Invalid date and time selected. Please check the format.");
        return;
      }
    } else {
      timestampToSave = initialData?.timestamp || 0;
    }

    const dataToSave: SymptomFormData = {
      id: initialData?.id || '',
      timestamp: timestampToSave,
      bowelMovement: bowelMovement || undefined,
      crampsSeverity: crampsSeverity > 0 ? crampsSeverity : undefined,
      bloatingSeverity: bloatingSeverity > 0 ? bloatingSeverity : undefined,
      urgency: urgency || undefined,
      notes: notes.trim() || undefined,
    };
    onSave(dataToSave);
  };

  const handleDelete = () => {
    if (initialData && onDelete) {
      if (window.confirm('Are you sure you want to delete this symptom log entry?')) {
        onDelete(initialData.id);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-700">
        <Stethoscope className="w-6 h-6 mr-2 text-red-500" />
        {isEditing ? 'Edit Symptom Log' : 'Log New Symptom'}
      </h2>

      {isEditing && (
        <div className="space-y-2">
          <label htmlFor="entryDateTimeSymptom" className="block text-sm font-medium text-gray-700 flex items-center">
            <CalendarClock className="w-4 h-4 mr-1 text-gray-500" /> Date & Time
          </label>
          <input
            type="datetime-local"
            id="entryDateTimeSymptom"
            value={editedDateTime}
            onChange={(e) => setEditedDateTime(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            required
          />
        </div>
      )}

       {/* Bristol Stool Chart - Updated with descriptions */}
       <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 flex items-center">
          <Scale className="w-4 h-4 mr-1 text-gray-500" /> Bowel Movement (Bristol Scale)
        </label>
        <select
          value={bowelMovement || ''}
          onChange={(e) => setBowelMovement(e.target.value as BristolStoolType || undefined)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="">-- Select Type (Optional) --</option>
          {bristolTypes.map(type => (
            <option key={type} value={type}>
              {bristolScaleDescriptions[type]} {/* Display descriptive label */}
            </option>
          ))}
        </select>
      </div>

      {/* Cramps Severity */}
      <div className="space-y-2">
        <label htmlFor="crampsSeverity" className="block text-sm font-medium text-gray-700 flex items-center">
          <Droplet className="w-4 h-4 mr-1 text-gray-500" /> Cramps Severity (0-5)
        </label>
        <select
          id="crampsSeverity"
          value={crampsSeverity}
          onChange={(e) => setCrampsSeverity(parseInt(e.target.value))}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          {severityLevels.map(level => (
            <option key={level} value={level}>{level === 0 ? '0 - None' : level}</option>
          ))}
        </select>
      </div>

      {/* Bloating Severity */}
      <div className="space-y-2">
        <label htmlFor="bloatingSeverity" className="block text-sm font-medium text-gray-700 flex items-center">
          <Wind className="w-4 h-4 mr-1 text-gray-500" /> Bloating Severity (0-5)
        </label>
        <select
          id="bloatingSeverity"
          value={bloatingSeverity}
          onChange={(e) => setBloatingSeverity(parseInt(e.target.value))}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          {severityLevels.map(level => (
            <option key={level} value={level}>{level === 0 ? '0 - None' : level}</option>
          ))}
        </select>
      </div>

      {/* Urgency */}
      <div className="flex items-center">
        <input
          id="urgency"
          type="checkbox"
          checked={urgency}
          onChange={(e) => setUrgency(e.target.checked)}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="urgency" className="ml-2 block text-sm text-gray-900 flex items-center">
          <AlertTriangle className="w-4 h-4 mr-1 text-gray-500" /> Urgency Present
        </label>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label htmlFor="symptomNotes" className="block text-sm font-medium text-gray-700 flex items-center">
          <StickyNote className="w-4 h-4 mr-1 text-gray-500" /> Notes (Optional)
        </label>
        <textarea
          id="symptomNotes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
          placeholder="Any additional details..."
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
          {isEditing ? 'Update Entry' : 'Save Symptom'}
        </button>
      </div>
    </form>
  );
};

export default SymptomForm;
