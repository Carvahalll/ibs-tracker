import React from 'react';
import { LogEntry } from '../types';
import LogItem from './LogItem';
import { ListChecks } from 'lucide-react';

interface LogListProps {
  entries: LogEntry[];
  onEditEntry: (entry: LogEntry) => void; // Add prop to handle edit clicks
}

const LogList: React.FC<LogListProps> = ({ entries, onEditEntry }) => {
  const sortedEntries = [...entries].sort((a, b) => b.timestamp - a.timestamp); // Keep sorting here for display

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <ListChecks className="w-6 h-6 mr-2 text-indigo-600" />
        Activity Log
      </h2>
      {sortedEntries.length === 0 ? (
        <p className="text-gray-500 text-center mt-8">No entries yet. Start logging!</p>
      ) : (
        <ul>
          {sortedEntries.map(entry => (
            <LogItem
              key={entry.id}
              entry={entry}
              onClick={onEditEntry} // Pass the handler down
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default LogList;
