import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { LogEntry, SymptomLog, StressLog, ChartDataPoint } from '../types';
import { formatTimestampToDateString, formatShortDate } from '../utils/dateUtils';
import { Droplet, Wind, BrainCircuit, CalendarDays } from 'lucide-react';

interface DataChartProps {
  logs: LogEntry[];
}

const processChartData = (logs: LogEntry[]): ChartDataPoint[] => {
  const dailyData: { [date: string]: Partial<ChartDataPoint> & { date: string } } = {};

  // Sort logs chronologically for easier processing (though grouping handles order)
  const sortedLogs = [...logs].sort((a, b) => a.timestamp - b.timestamp);

  sortedLogs.forEach(log => {
    const dateStr = formatTimestampToDateString(log.timestamp);

    if (!dailyData[dateStr]) {
      dailyData[dateStr] = { date: dateStr, cramps: null, bloating: null, stress: null };
    }

    if (log.type === 'symptom') {
      const symptomLog = log as SymptomLog;
      if (symptomLog.crampsSeverity !== undefined) {
        dailyData[dateStr].cramps = Math.max(dailyData[dateStr].cramps ?? 0, symptomLog.crampsSeverity);
      }
      if (symptomLog.bloatingSeverity !== undefined) {
        dailyData[dateStr].bloating = Math.max(dailyData[dateStr].bloating ?? 0, symptomLog.bloatingSeverity);
      }
    } else if (log.type === 'stress') {
      const stressLog = log as StressLog;
      // Since stress is logged once daily, we just assign it.
      // If multiple stress logs existed for a day (shouldn't happen with current logic),
      // this would take the last one based on sorted order.
      dailyData[dateStr].stress = stressLog.level;
    }
  });

  // Convert to array and sort by date
  return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
};


const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const date = formatShortDate(label);
      return (
        <div className="bg-white p-3 rounded shadow-lg border border-gray-200 text-sm">
          <p className="font-semibold mb-2 flex items-center"><CalendarDays size={14} className="mr-1" /> {date}</p>
          {payload.map((pld: any) => (
            pld.value !== null && // Only show lines with actual data for that point
            <div key={pld.dataKey} style={{ color: pld.color }} className="flex items-center mb-1">
               {pld.dataKey === 'cramps' && <Droplet size={14} className="mr-1" />}
               {pld.dataKey === 'bloating' && <Wind size={14} className="mr-1" />}
               {pld.dataKey === 'stress' && <BrainCircuit size={14} className="mr-1" />}
              <span className="capitalize mr-1">{pld.dataKey}:</span>
              <span className="font-medium">{pld.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

const DataChart: React.FC<DataChartProps> = ({ logs }) => {
  const chartData = useMemo(() => processChartData(logs), [logs]);

  if (chartData.length < 2) { // Need at least 2 points to draw lines
    return (
      <div className="p-4 text-center text-gray-500 bg-white rounded-lg shadow m-4">
        <p>Not enough data to display a chart yet.</p>
        <p className="text-sm mt-1">Log symptoms or stress for at least two different days!</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow m-4">
       <h2 className="text-lg font-semibold mb-4 text-gray-700">Symptom & Stress Trends</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 10, // Adjusted right margin
            left: -20, // Adjusted left margin
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
             dataKey="date"
             tickFormatter={formatShortDate}
             tick={{ fontSize: 10, fill: '#666' }}
             padding={{ left: 10, right: 10 }} // Add padding
             interval="preserveStartEnd" // Show first and last tick
             minTickGap={20} // Minimum gap between ticks
           />
          <YAxis
            domain={[0, 5]}
            allowDecimals={false}
            tick={{ fontSize: 10, fill: '#666' }}
            />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          <Line
            type="monotone"
            dataKey="cramps"
            stroke="#ef4444" // Red
            strokeWidth={2}
            name="Cramps"
            dot={false}
            connectNulls={true} // Connect line over missing data points
          />
          <Line
            type="monotone"
            dataKey="bloating"
            stroke="#3b82f6" // Blue
            strokeWidth={2}
            name="Bloating"
            dot={false}
            connectNulls={true}
          />
          <Line
            type="monotone"
            dataKey="stress"
            stroke="#a855f7" // Purple
            strokeWidth={2}
            name="Stress"
            dot={false}
            connectNulls={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DataChart;
