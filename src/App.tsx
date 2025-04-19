import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { LogEntry, SymptomLog, IntakeLog, StressLog, NavItem } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import LogList from './components/LogList';
import SymptomForm from './components/SymptomForm';
import IntakeForm from './components/IntakeForm';
import StressForm from './components/StressForm';
import BottomNav from './components/BottomNav';
import DataChart from './components/DataChart';
import { isToday } from './utils/dateUtils';
import { ListChecks, Stethoscope, UtensilsCrossed, BrainCircuit, HeartPulse, BellOff, BellRing, BarChartHorizontal, Download } from 'lucide-react'; // Import Download icon

const navItems: NavItem[] = [
  { id: 'log', label: 'Log', icon: ListChecks },
  { id: 'addSymptom', label: 'Symptom', icon: Stethoscope },
  { id: 'addIntake', label: 'Intake', icon: UtensilsCrossed },
  { id: 'addStress', label: 'Stress', icon: BrainCircuit },
  { id: 'chart', label: 'Chart', icon: BarChartHorizontal },
];

const LAST_STRESS_NOTIFICATION_DATE_KEY = 'lastStressNotificationDate';

function App() {
  const [logs, setLogs] = useLocalStorage<LogEntry[]>('ibsTrackerLogs', []);
  const [activeView, setActiveView] = useState<NavItem['id']>('log');
  const [editingEntry, setEditingEntry] = useState<LogEntry | null>(null);
  const [stressLoggedToday, setStressLoggedToday] = useState<boolean>(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [lastNotificationDate, setLastNotificationDate] = useLocalStorage<string | null>(LAST_STRESS_NOTIFICATION_DATE_KEY, null);

  // --- Notification and Stress Log Status Logic ---
  const checkStressLogStatus = useCallback(() => {
    const lastStressLog = logs
      .filter((log): log is StressLog => log.type === 'stress')
      .sort((a, b) => b.timestamp - a.timestamp)[0];
    setStressLoggedToday(lastStressLog ? isToday(lastStressLog.timestamp) : false);
  }, [logs]);

  const requestNotification = useCallback(() => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notification');
      setNotificationPermission('denied'); return;
    }
    if (Notification.permission === 'granted') {
       setNotificationPermission('granted'); return;
    }
    if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(setNotificationPermission);
    } else {
       setNotificationPermission('denied');
    }
  }, []);

  useEffect(() => {
    requestNotification();
    checkStressLogStatus();
    const intervalId = setInterval(() => {
      const now = new Date();
      const currentHour = now.getHours();
      const todayStr = now.toDateString();
      const lastStressLog = logs.filter(l => l.type === 'stress').sort((a, b) => b.timestamp - a.timestamp)[0];
      const needsReset = lastStressLog ? !isToday(lastStressLog.timestamp) : true;

      if (needsReset && stressLoggedToday) {
         console.log("Day changed, resetting stress log status.");
         setStressLoggedToday(false);
         if (lastNotificationDate && lastNotificationDate !== todayStr) {
            setLastNotificationDate(null);
         }
      } else if (!needsReset && !stressLoggedToday) {
         checkStressLogStatus();
      }

      if (notificationPermission === 'granted' && currentHour >= 18 && !stressLoggedToday && lastNotificationDate !== todayStr) {
        console.log("Showing stress log reminder notification.");
        new Notification('IBS Tracker Reminder', { body: "Don't forget to log your stress level for today!", icon: '/favicon.ico' });
        setLastNotificationDate(todayStr);
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [logs, checkStressLogStatus, notificationPermission, stressLoggedToday, requestNotification, lastNotificationDate, setLastNotificationDate]);
  // --- End Notification Logic ---


  // --- CRUD Operations ---
  const createLogEntry = (entryData: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const newEntry: LogEntry = {
      ...entryData,
      id: uuidv4(),
      timestamp: Date.now(),
    };
    setLogs(prevLogs => [...prevLogs, newEntry].sort((a, b) => b.timestamp - a.timestamp));
    setActiveView('log');
    setEditingEntry(null);

    if (newEntry.type === 'stress') {
      setStressLoggedToday(true);
    }
  };

  const updateLogEntry = (updatedEntryData: LogEntry) => {
    setLogs(prevLogs =>
      prevLogs.map(log => (log.id === updatedEntryData.id ? updatedEntryData : log))
              .sort((a, b) => b.timestamp - a.timestamp)
    );
    setActiveView('log');
    setEditingEntry(null);

    if (updatedEntryData.type === 'stress') {
        checkStressLogStatus(); // Re-check in case a stress log was edited
    }
  };

  const deleteLogEntry = (id: string) => {
    const entryToDelete = logs.find(log => log.id === id);
    setLogs(prevLogs => prevLogs.filter(log => log.id !== id));
    setActiveView('log');
    setEditingEntry(null);

    // If the deleted entry was today's stress log, update the status
    if (entryToDelete?.type === 'stress' && isToday(entryToDelete.timestamp)) {
        checkStressLogStatus(); // Re-check status after deletion
    }
  };

  // --- Event Handlers ---
  const handleSaveSymptom = (data: Omit<SymptomLog, 'type'>) => {
    const entryData = { ...data, type: 'symptom' as const };
    if (data.id && data.timestamp) {
      updateLogEntry(entryData);
    } else {
      createLogEntry(entryData);
    }
  };

  const handleSaveIntake = (data: Omit<IntakeLog, 'type'>) => {
     const entryData = { ...data, type: 'intake' as const };
    if (data.id && data.timestamp) {
      updateLogEntry(entryData);
    } else {
      createLogEntry(entryData);
    }
  };

  const handleSaveStress = (data: Omit<StressLog, 'type'>) => {
    const entryData = { ...data, type: 'stress' as const };
    if (data.id && data.timestamp) {
        updateLogEntry(entryData);
    } else {
        if (stressLoggedToday) {
            alert("You have already logged your stress level for today.");
            setActiveView('log');
            return;
        }
        createLogEntry(entryData);
    }
  };

  const handleEditEntry = (entry: LogEntry) => {
    setEditingEntry(entry);
    switch (entry.type) {
      case 'symptom': setActiveView('addSymptom'); break;
      case 'intake': setActiveView('addIntake'); break;
      case 'stress': setActiveView('addStress'); break;
    }
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setActiveView('log');
  };

  const handleNavClick = (id: NavItem['id']) => {
     // Prevent navigating to addStress if already logged and not editing
     if (id === 'addStress' && stressLoggedToday && !editingEntry) {
       console.log("Stress already logged today, navigation blocked.");
       return;
     }

     // If currently editing and navigating away from the edit form, cancel edit
     const isEditingFormActive = editingEntry && activeView.startsWith('add');
     if (isEditingFormActive && id !== activeView) {
        handleCancelEdit(); // This also sets activeView to 'log' if called
        // If handleCancelEdit didn't change the view (e.g., navigating from edit to chart),
        // we still need to set the new view.
        if (activeView !== 'log') {
            setActiveView(id);
            return; // Prevent setting activeView again below
        }
     }

     // If navigating to log or chart, ensure editing state is cleared
     if (id === 'log' || id === 'chart') {
        setEditingEntry(null);
     }

     setActiveView(id);
  }

  // --- Data Export ---
  const handleExportData = () => {
    if (logs.length === 0) {
      alert("No data to export.");
      return;
    }

    // Sort data chronologically for easier analysis
    const sortedLogs = [...logs].sort((a, b) => a.timestamp - b.timestamp);

    // Convert to formatted JSON
    const jsonData = JSON.stringify(sortedLogs, null, 2); // Use 2 spaces for indentation

    // Create a Blob
    const blob = new Blob([jsonData], { type: 'application/json' });

    // Create a download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    link.download = `ibs_tracker_data_${dateStr}.json`;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  // --- End Data Export ---

  // --- Render Logic ---
  const renderActiveView = () => {
    switch (activeView) {
      case 'addSymptom':
        return <div className="p-4"><SymptomForm
                    onSave={handleSaveSymptom}
                    initialData={editingEntry?.type === 'symptom' ? editingEntry : null}
                    onCancel={handleCancelEdit}
                    onDelete={deleteLogEntry}
                 /></div>;
      case 'addIntake':
        return <div className="p-4"><IntakeForm
                    onSave={handleSaveIntake}
                    initialData={editingEntry?.type === 'intake' ? editingEntry : null}
                    onCancel={handleCancelEdit}
                    onDelete={deleteLogEntry}
                /></div>;
      case 'addStress':
        if (stressLoggedToday && !editingEntry) {
          return (
            <div className="p-4 text-center text-gray-600 bg-white rounded-lg shadow m-4">
              <BrainCircuit className="w-10 h-10 mx-auto mb-2 text-purple-300" />
              <p>You've already logged your stress for today.</p>
              <p className="text-sm mt-1">Come back tomorrow!</p>
            </div>
          );
        }
        return <div className="p-4"><StressForm
                    onSave={handleSaveStress}
                    initialData={editingEntry?.type === 'stress' ? editingEntry : null}
                    onCancel={handleCancelEdit}
                    onDelete={deleteLogEntry}
                /></div>;
      case 'chart':
        return <DataChart logs={logs} />;
      case 'log':
      default:
        if (editingEntry) setEditingEntry(null);
        return <LogList entries={logs} onEditEntry={handleEditEntry} />;
    }
  };

  // Determine notification button title and classes
  const notificationTitle = notificationPermission === 'granted' ? "Notifications enabled" :
                            notificationPermission === 'denied' ? "Notifications blocked by browser" :
                            "Click to enable notifications";
  const notificationClasses = `p-1 rounded ${
      notificationPermission === 'granted' ? 'text-green-600 hover:bg-green-100' :
      notificationPermission === 'denied' ? 'text-red-600 hover:bg-red-100 cursor-not-allowed' :
      'text-gray-500 hover:bg-gray-100'
  }`;


  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
       <header className="bg-white shadow-sm sticky top-0 z-10">
         <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
                <HeartPulse className="w-8 h-8 text-indigo-600 mr-2" />
                <h1 className="text-xl font-bold text-gray-800">IBS Tracker</h1>
            </div>
            <div className="flex items-center space-x-2"> {/* Container for buttons */}
                <button
                    onClick={requestNotification}
                    title={notificationTitle}
                    className={notificationClasses}
                    disabled={notificationPermission === 'denied'}
                >
                    {notificationPermission === 'granted' ? <BellRing size={20} /> : <BellOff size={20} />}
                </button>
                <button
                    onClick={handleExportData}
                    title="Export all data as JSON"
                    className="p-1 rounded text-blue-600 hover:bg-blue-100"
                    disabled={logs.length === 0} // Disable if no logs
                >
                    <Download size={20} />
                </button>
            </div>
         </div>
       </header>

      <main className="flex-grow pb-20">
         <div className="max-w-md mx-auto">
            {renderActiveView()}
         </div>
      </main>

      <BottomNav
        items={navItems}
        activeItem={activeView}
        onItemClick={handleNavClick}
        disabledItems={(stressLoggedToday && !(editingEntry?.type === 'stress')) ? ['addStress'] : []}
      />
    </div>
  );
}

export default App;
