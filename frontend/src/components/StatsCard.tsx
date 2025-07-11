import React from 'react';
import { LeadStats } from '../types';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface StatsCardProps {
  stats: LeadStats | null;
  loading: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ stats, loading }) => {
  // Prepare chart data
  const chartData = {
    labels: ['High Intent', 'Low Intent'],
    datasets: [
      {
        data: stats ? [stats.high_intent_leads, stats.total_leads - stats.high_intent_leads] : [0, 0],
        backgroundColor: ['#10B981', '#F59E0B'],
        borderColor: ['#059669', '#D97706'],
        borderWidth: 1,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Lead Statistics</h2>
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Loading stats...</span>
        </div>
      ) : !stats ? (
        <div className="text-center py-8 text-gray-500">
          No statistics available yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500">Total Leads</div>
              <div className="text-2xl font-bold">{stats.total_leads}</div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500">High Intent Leads</div>
              <div className="text-2xl font-bold text-green-600">{stats.high_intent_leads}</div>
              <div className="text-sm text-gray-500">
                ({stats.total_leads > 0 
                  ? `${((stats.high_intent_leads / stats.total_leads) * 100).toFixed(1)}%` 
                  : '0%'})
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500">Average Initial Score</div>
              <div className="text-2xl font-bold">{stats.avg_initial_score.toFixed(1)}</div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500">Average Reranked Score</div>
              <div className="text-2xl font-bold">{stats.avg_reranked_score.toFixed(1)}</div>
              <div className="text-sm text-gray-500">
                {stats.avg_reranked_score > stats.avg_initial_score 
                  ? `+${(stats.avg_reranked_score - stats.avg_initial_score).toFixed(1)} from initial` 
                  : stats.avg_reranked_score < stats.avg_initial_score
                    ? `-${(stats.avg_initial_score - stats.avg_reranked_score).toFixed(1)} from initial`
                    : 'Same as initial'}
              </div>
            </div>
          </div>
          
          <div className="h-64">
            <h3 className="text-center text-sm font-medium text-gray-500 mb-2">Lead Intent Distribution</h3>
            <Doughnut data={chartData} options={chartOptions} />
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsCard;