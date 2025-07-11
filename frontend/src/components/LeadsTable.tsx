import React, { useState, useEffect } from 'react';
import { Lead } from '../types';

interface LeadsTableProps {
  leads: Lead[];
  loading: boolean;
}

const LeadsTable: React.FC<LeadsTableProps> = ({ leads, loading }) => {
  const [sortedLeads, setSortedLeads] = useState<Lead[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Lead; direction: 'ascending' | 'descending' } | null>(null);
  
  useEffect(() => {
    // Default sort by reranked_score descending when leads change
    let sortableLeads = [...leads];
    sortableLeads.sort((a, b) => b.reranked_score - a.reranked_score);
    setSortedLeads(sortableLeads);
    setSortConfig({ key: 'reranked_score', direction: 'descending' });
  }, [leads]);
  
  const requestSort = (key: keyof Lead) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    } else if (sortConfig && sortConfig.key === key && sortConfig.direction === 'descending') {
      direction = 'ascending';
    }
    
    setSortConfig({ key, direction });
    
    const sortableLeads = [...leads];
    sortableLeads.sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    
    setSortedLeads(sortableLeads);
  };
  
  const getClassNamesFor = (name: keyof Lead) => {
    if (!sortConfig) {
      return '';
    }
    return sortConfig.key === name ? sortConfig.direction : '';
  };
  
  const getSortIcon = (name: keyof Lead) => {
    if (!sortConfig || sortConfig.key !== name) {
      return '⇅';
    }
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    if (score >= 20) return 'text-orange-500';
    return 'text-red-500';
  };
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Scored Leads</h2>
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Loading leads...</span>
        </div>
      ) : sortedLeads.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No leads available. Submit a lead to see results.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('lead_id')}
                >
                  <div className="flex items-center">
                    ID <span className="ml-1">{getSortIcon('lead_id')}</span>
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('email')}
                >
                  <div className="flex items-center">
                    Email <span className="ml-1">{getSortIcon('email')}</span>
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('initial_score')}
                >
                  <div className="flex items-center">
                    Initial Score <span className="ml-1">{getSortIcon('initial_score')}</span>
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('reranked_score')}
                >
                  <div className="flex items-center">
                    Reranked Score <span className="ml-1">{getSortIcon('reranked_score')}</span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comments
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedLeads.map((lead) => (
                <tr key={lead.lead_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lead.lead_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lead.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={getScoreColor(lead.initial_score)}>
                      {lead.initial_score.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={`${getScoreColor(lead.reranked_score)} font-semibold`}>
                      {lead.reranked_score.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {lead.comments}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeadsTable;