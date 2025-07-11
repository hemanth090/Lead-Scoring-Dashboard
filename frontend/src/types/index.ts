export interface LeadFormData {
  phone_number: string;
  email: string;
  credit_score: number;
  age_group: string;
  family_background: string;
  income: number;
  property_type: string;
  budget: number;
  location: string;
  previous_inquiries: number;
  time_on_market: number;
  response_time_minutes: number;
  comments: string;
  consent: boolean;
}

export interface LeadScore {
  initial_score: number;
  reranked_score: number;
  lead_id: number;
}

export interface Lead {
  lead_id: number;
  email: string;
  initial_score: number;
  reranked_score: number;
  comments: string;
}

export interface LeadStats {
  total_leads: number;
  high_intent_leads: number;
  avg_initial_score: number;
  avg_reranked_score: number;
}