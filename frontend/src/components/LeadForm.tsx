import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { LeadFormData, LeadScore } from '../types';
import { scoreLead } from '../services/api';

interface LeadFormProps {
  onLeadScored: (score: LeadScore) => void;
  setLoading: (loading: boolean) => void;
}

const LeadForm: React.FC<LeadFormProps> = ({ onLeadScored, setLoading }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<LeadFormData>({
    defaultValues: {
      phone_number: '',
      email: '',
      credit_score: 650,
      age_group: '26-35',
      family_background: 'Single',
      income: 500000,
      property_type: 'Apartment',
      budget: 2500000,
      location: 'Urban',
      previous_inquiries: 0,
      time_on_market: 30,
      response_time_minutes: 60,
      comments: '',
      consent: false,
    }
  });
  
  const [error, setError] = useState<string | null>(null);
  
  const onSubmit: SubmitHandler<LeadFormData> = async (data) => {
    setLoading(true);
    setError(null);
    
    try {
      const scoreResult = await scoreLead(data);
      onLeadScored(scoreResult);
      reset();
    } catch (err: any) {
      console.error('Error submitting lead:', err);
      setError(err.response?.data?.detail || 'Failed to score lead. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Submit Lead Information</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Contact Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="text"
              placeholder="+91-9876543210"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.phone_number ? 'border-red-500' : 'border'}`}
              {...register('phone_number', { 
                required: 'Phone number is required',
                pattern: {
                  value: /^\+91-[0-9]{10}$/,
                  message: 'Phone number must be in format +91-XXXXXXXXXX'
                }
              })}
            />
            {errors.phone_number && <p className="mt-1 text-sm text-red-600">{errors.phone_number.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              placeholder="email@example.com"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border'}`}
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>
          
          {/* Financial Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Credit Score (300-850)</label>
            <input
              type="number"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.credit_score ? 'border-red-500' : 'border'}`}
              {...register('credit_score', { 
                required: 'Credit score is required',
                min: {
                  value: 300,
                  message: 'Credit score must be at least 300'
                },
                max: {
                  value: 850,
                  message: 'Credit score cannot exceed 850'
                }
              })}
            />
            {errors.credit_score && <p className="mt-1 text-sm text-red-600">{errors.credit_score.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Income (INR)</label>
            <input
              type="number"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.income ? 'border-red-500' : 'border'}`}
              {...register('income', { 
                required: 'Income is required',
                min: {
                  value: 100000,
                  message: 'Income must be at least 100,000 INR'
                },
                max: {
                  value: 1000000,
                  message: 'Income cannot exceed 1,000,000 INR'
                }
              })}
            />
            {errors.income && <p className="mt-1 text-sm text-red-600">{errors.income.message}</p>}
          </div>
          
          {/* Demographic Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Age Group</label>
            <select
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.age_group ? 'border-red-500' : 'border'}`}
              {...register('age_group', { required: 'Age group is required' })}
            >
              <option value="18-25">18-25</option>
              <option value="26-35">26-35</option>
              <option value="36-50">36-50</option>
              <option value="51+">51+</option>
            </select>
            {errors.age_group && <p className="mt-1 text-sm text-red-600">{errors.age_group.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Family Background</label>
            <select
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.family_background ? 'border-red-500' : 'border'}`}
              {...register('family_background', { required: 'Family background is required' })}
            >
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Married with Kids">Married with Kids</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
            </select>
            {errors.family_background && <p className="mt-1 text-sm text-red-600">{errors.family_background.message}</p>}
          </div>
          
          {/* Property Preferences */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Property Type</label>
            <select
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.property_type ? 'border-red-500' : 'border'}`}
              {...register('property_type', { required: 'Property type is required' })}
            >
              <option value="Apartment">Apartment</option>
              <option value="House">House</option>
              <option value="Villa">Villa</option>
              <option value="Penthouse">Penthouse</option>
              <option value="Studio">Studio</option>
            </select>
            {errors.property_type && <p className="mt-1 text-sm text-red-600">{errors.property_type.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Budget (INR)</label>
            <input
              type="number"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.budget ? 'border-red-500' : 'border'}`}
              {...register('budget', { 
                required: 'Budget is required',
                min: {
                  value: 0,
                  message: 'Budget cannot be negative'
                }
              })}
            />
            {errors.budget && <p className="mt-1 text-sm text-red-600">{errors.budget.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <select
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.location ? 'border-red-500' : 'border'}`}
              {...register('location', { required: 'Location is required' })}
            >
              <option value="Urban">Urban</option>
              <option value="Suburban">Suburban</option>
              <option value="Rural">Rural</option>
            </select>
            {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>}
          </div>
          
          {/* Behavioral Metrics */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Previous Inquiries</label>
            <input
              type="number"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.previous_inquiries ? 'border-red-500' : 'border'}`}
              {...register('previous_inquiries', { 
                required: 'Previous inquiries is required',
                min: {
                  value: 0,
                  message: 'Previous inquiries cannot be negative'
                }
              })}
            />
            {errors.previous_inquiries && <p className="mt-1 text-sm text-red-600">{errors.previous_inquiries.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Time on Market (days)</label>
            <input
              type="number"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.time_on_market ? 'border-red-500' : 'border'}`}
              {...register('time_on_market', { 
                required: 'Time on market is required',
                min: {
                  value: 1,
                  message: 'Time on market must be at least 1 day'
                }
              })}
            />
            {errors.time_on_market && <p className="mt-1 text-sm text-red-600">{errors.time_on_market.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Response Time (minutes)</label>
            <input
              type="number"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.response_time_minutes ? 'border-red-500' : 'border'}`}
              {...register('response_time_minutes', { 
                required: 'Response time is required',
                min: {
                  value: 1,
                  message: 'Response time must be at least 1 minute'
                }
              })}
            />
            {errors.response_time_minutes && <p className="mt-1 text-sm text-red-600">{errors.response_time_minutes.message}</p>}
          </div>
        </div>
        
        {/* Comments */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Comments</label>
          <textarea
            rows={3}
            placeholder="Add any additional comments or requirements..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border"
            {...register('comments')}
          />
        </div>
        
        {/* Consent */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              type="checkbox"
              className={`focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded ${errors.consent ? 'border-red-500' : ''}`}
              {...register('consent', { required: 'Consent is required' })}
            />
          </div>
          <div className="ml-3 text-sm">
            <label className="font-medium text-gray-700">I consent to data processing</label>
            {errors.consent && <p className="mt-1 text-sm text-red-600">{errors.consent.message}</p>}
          </div>
        </div>
        
        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Submit Lead
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeadForm;