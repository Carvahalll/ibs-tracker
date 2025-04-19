import React from 'react';
import { LogEntry, SymptomLog, IntakeLog, StressLog } from '../types';
import { Stethoscope, UtensilsCrossed, BrainCircuit, Clock, StickyNote, AlertTriangle, Scale, Droplet, Wind, Gauge } from 'lucide-react';

interface LogItemProps {
  entry: LogEntry;
  onClick: (entry: LogEntry) => void; // Add onClick handler prop
}

const getIcon = (type: LogEntry['type']) => {
  switch (type) {
    case 'symptom': return <Stethoscope className="w-5 h-5 text-red-500" />;
    case 'intake': return <UtensilsCrossed className="w-5 h-5 text-blue-500" />;
    case 'stress': return <BrainCircuit className="w-5 h-5 text-purple-500" />;
    default: return null;
  }
};

const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const renderSeverity = (label: string, value: number | undefined, Icon: React.ElementType) => {
  if (value === undefined || value < 0) return null;
  return (
    <div className="flex items-center text-sm text-gray-600">
      <Icon className="w-4 h-4 mr-1" />
      {label}: {value}/5
    </div>
  );
};

const renderBristol = (type: SymptomLog['bowelMovement']) => {
  if (!type) return null;
  return (
    <div className="flex items-center text-sm text-gray-600">
      <Scale className="w-4 h-4 mr-1" />
      BM: {type.replace('type', 'Type ')}
    </div>
  );
};

const renderUrgency = (urgency: boolean | undefined) => {
  if (urgency === undefined || !urgency) return null;
  return (
    <div className="flex items-center text-sm text-red-600 font-medium">
      <AlertTriangle className="w-4 h-4 mr-1" />
      Urgency
    </div>
  );
};


const LogItem: React.FC<LogItemProps> = ({ entry, onClick }) => {
  const renderDetails = () => {
    switch (entry.type) {
      case 'symptom':
        const symptom = entry as SymptomLog;
        return (
          <>
            {renderBristol(symptom.bowelMovement)}
            {renderSeverity('Cramps', symptom.crampsSeverity, Droplet)}
            {renderSeverity('Bloating', symptom.bloatingSeverity, Wind)}
            {renderUrgency(symptom.urgency)}
          </>
        );
      case 'intake':
        const intake = entry as IntakeLog;
        return (
          <p className="text-sm text-gray-800 font-medium">
            {intake.item} {intake.quantity ? `(${intake.quantity})` : ''}
          </p>
        );
      case 'stress':
        const stress = entry as StressLog;
        // Prevent editing stress logs from previous days if already logged today
        // Note: This specific check might be better handled in App.tsx before navigating
        return renderSeverity('Stress Level', stress.level, Gauge);
      default:
        return null;
    }
  };

  return (
    <li
      className="bg-white p-4 rounded-lg shadow mb-3 border-l-4 border-gray-300 cursor-pointer hover:shadow-md transition-shadow duration-200"
      style={{ borderColor: entry.type === 'symptom' ? '#ef4444' : entry.type === 'intake' ? '#3b82f6' : '#a855f7' }}
      onClick={() => onClick(entry)} // Call onClick handler
      title="Click to edit this entry" // Add tooltip
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getIcon(entry.type)}
          <span className="font-semibold capitalize">{entry.type}</span>
        </div>
        <div className="flex items-center text-xs text-gray-500">
          <Clock className="w-3 h-3 mr-1" />
          {formatTimestamp(entry.timestamp)}
        </div>
      </div>
      <div className="space-y-1">
        {renderDetails()}
        {entry.notes && (
          <div className="flex items-start text-sm text-gray-600 mt-1">
            <StickyNote className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
            <p className="italic">{entry.notes}</p>
          </div>
        )}
      </div>
    </li>
  );
};

export default LogItem;
