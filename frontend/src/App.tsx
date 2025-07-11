import React, { useState, useEffect } from 'react';
import LeadForm from './components/LeadForm';
import LeadsTable from './components/LeadsTable';
import StatsCard from './components/StatsCard';
import { Lead, LeadScore, LeadStats } from './types';
import { getLeads, getLeadStats, checkHealth } from './services/api';

const App: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [apiStatus, setApiStatus] = useState<{ status: string; model_loaded: boolean } | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Load leads and stats from localStorage on initial render
  useEffect(() => {
    const storedLeads = localStorage.getItem('leads');
    if (storedLeads) {
      try {
        setLeads(JSON.parse(storedLeads));
      } catch (error) {
        console.error('Error parsing stored leads:', error);
      }
    }
    
    const storedStats = localStorage.getItem('stats');
    if (storedStats) {
      try {
        setStats(JSON.parse(storedStats));
      } catch (error) {
        console.error('Error parsing stored stats:', error);
      }
    }
    
    // Check API health
    checkApiHealth();
  }, []);
  
  // Save leads and stats to localStorage when they change
  useEffect(() => {
    if (leads.length > 0) {
      localStorage.setItem('leads', JSON.stringify(leads));
    }
    
    if (stats) {
      localStorage.setItem('stats', JSON.stringify(stats));
    }
  }, [leads, stats]);
  
  const checkApiHealth = async () => {
    try {
      const health = await checkHealth();
      setApiStatus(health);
      setApiError(null);
      
      // If API is healthy, fetch latest data
      if (health.status === 'healthy') {
        fetchLeadsAndStats();
      }
    } catch (error) {
      console.error('API health check failed:', error);
      setApiError('Cannot connect to the API. Please ensure the backend server is running.');
    }
  };
  
  const fetchLeadsAndStats = async () => {
    setLoading(true);
    
    try {
      // Fetch leads and stats in parallel
      const [leadsData, statsData] = await Promise.all([
        getLeads(),
        getLeadStats()
      ]);
      
      setLeads(leadsData);
      setStats(statsData);
      setApiError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setApiError('Failed to fetch data from the API.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLeadScored = (score: LeadScore) => {
    // Fetch updated leads and stats after scoring
    fetchLeadsAndStats();
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Lead Scoring Dashboard</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* API Status Alert */}
        {apiError && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">{apiError}</p>
                <button 
                  onClick={checkApiHealth}
                  className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Model Status Alert */}
        {apiStatus && !apiStatus.model_loaded && !apiError && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">
                  The ML model is not loaded. Please run the setup script on the backend to generate data and train the model.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Lead Form */}
          <LeadForm onLeadScored={handleLeadScored} setLoading={setLoading} />
          
          {/* Stats Card */}
          <StatsCard stats={stats} loading={loading} />
        </div>
        
        {/* Leads Table */}
        <LeadsTable leads={leads} loading={loading} />
      </main>
      
      <footer className="bg-white shadow mt-8 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            Lead Scoring Dashboard - Powered by ML and LLM-inspired re-ranking
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;