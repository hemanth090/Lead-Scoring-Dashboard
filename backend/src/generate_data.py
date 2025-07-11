import pandas as pd
import numpy as np
from faker import Faker
import random
import os

# Set random seed for reproducibility
np.random.seed(42)
random.seed(42)
fake = Faker()
Faker.seed(42)

# Number of samples
n_samples = 10000

def generate_synthetic_data():
    """Generate synthetic lead data with meaningful relationships and patterns."""
    
    # Initialize data dictionary
    data = {
        'phone_number': [],
        'email': [],
        'credit_score': [],
        'age_group': [],
        'family_background': [],
        'income': [],
        'property_type': [],
        'budget': [],
        'location': [],
        'previous_inquiries': [],
        'time_on_market': [],  # Days property has been on market
        'response_time_minutes': [],  # How quickly they respond to messages
        'comments': [],
        'high_intent': []  # Target variable (1 for high intent, 0 for low intent)
    }
    
    # Define possible values for categorical variables
    age_groups = ['18-25', '26-35', '36-50', '51+']
    age_group_weights = [0.15, 0.40, 0.30, 0.15]  # Younger adults more likely to be looking
    
    family_backgrounds = ['Single', 'Married', 'Married with Kids', 'Divorced', 'Widowed']
    family_weights = [0.30, 0.25, 0.30, 0.10, 0.05]
    
    property_types = ['Apartment', 'House', 'Villa', 'Penthouse', 'Studio']
    property_weights = [0.40, 0.30, 0.10, 0.05, 0.15]
    
    locations = ['Urban', 'Suburban', 'Rural']
    location_weights = [0.50, 0.40, 0.10]
    
    # Generate data
    for _ in range(n_samples):
        # Generate basic contact info
        phone = f"+91-{random.randint(7000000000, 9999999999)}"
        email = fake.email()
        
        # Generate demographic info
        age_group = random.choices(age_groups, weights=age_group_weights)[0]
        family_background = random.choices(family_backgrounds, weights=family_weights)[0]
        
        # Financial info with realistic patterns
        # Credit score is higher for older age groups
        base_credit = 300
        if age_group == '18-25':
            credit_score = base_credit + np.random.normal(200, 50)
        elif age_group == '26-35':
            credit_score = base_credit + np.random.normal(300, 50)
        elif age_group == '36-50':
            credit_score = base_credit + np.random.normal(350, 50)
        else:  # 51+
            credit_score = base_credit + np.random.normal(400, 50)
        
        credit_score = max(300, min(850, int(credit_score)))
        
        # Income is correlated with age and credit score
        base_income = 100000
        income_multiplier = 1.0
        
        if age_group == '18-25':
            income_multiplier = np.random.normal(1.0, 0.2)
        elif age_group == '26-35':
            income_multiplier = np.random.normal(1.5, 0.3)
        elif age_group == '36-50':
            income_multiplier = np.random.normal(2.5, 0.5)
        else:  # 51+
            income_multiplier = np.random.normal(3.0, 0.7)
            
        # Credit score also affects income multiplier
        income_multiplier *= (credit_score / 600)
        
        income = int(base_income * income_multiplier)
        income = max(100000, min(1000000, income))
        
        # Property preferences
        property_type = random.choices(property_types, weights=property_weights)[0]
        
        # Budget is correlated with income
        budget_ratio = np.random.normal(5, 1)  # Budget is typically 3-7x annual income
        budget = int(income * budget_ratio)
        
        # Location preference
        location = random.choices(locations, weights=location_weights)[0]
        
        # Behavioral features
        previous_inquiries = np.random.poisson(2)  # Most have 0-4 previous inquiries
        
        # Time on market - newer listings get more interest
        time_on_market = max(1, int(np.random.exponential(30)))  # Days
        
        # Response time - faster responders are more serious buyers
        response_time_minutes = max(1, int(np.random.exponential(60)))  # Minutes
        
        # Generate comments with intent signals
        comment_templates = [
            "Looking for a {property_type} in {location} area.",
            "Need a {property_type} for my {family_background} family.",
            "Interested in properties around {budget} budget.",
            "Want to move within {timeline} months.",
            "Require financing options for {property_type}.",
            "Currently renting, want to buy a {property_type}.",
            "Relocating to {location} area soon.",
            "Investment opportunity in {location} area.",
            "Need property with good schools nearby.",
            "Looking for retirement home options."
        ]
        
        # Add intent signals to some comments
        high_intent_signals = [
            "urgent", "need immediately", "ready to purchase", 
            "pre-approved loan", "cash buyer", "looking to close quickly",
            "very interested", "perfect match", "dream home", "must have"
        ]
        
        low_intent_signals = [
            "just browsing", "not sure yet", "might consider", 
            "too expensive", "not interested", "just checking",
            "maybe next year", "not ready", "need to think", "too small"
        ]
        
        # Determine intent (target variable)
        # Factors that increase intent: higher income, faster response time, fewer days on market
        intent_score = 0
        
        # Financial factors
        intent_score += (income / 1000000) * 30  # 0-30 points
        intent_score += (credit_score - 300) / 550 * 20  # 0-20 points
        
        # Behavioral factors
        intent_score += max(0, 10 - previous_inquiries) * 2  # 0-20 points (fewer inquiries is better)
        intent_score += max(0, 10 - (response_time_minutes / 10)) * 1.5  # 0-15 points (faster response is better)
        intent_score += max(0, 10 - (time_on_market / 10)) * 1.5  # 0-15 points (newer listings get more interest)
        
        # Normalize to 0-100
        intent_score = min(100, max(0, intent_score))
        
        # Convert to binary target (threshold at 60)
        high_intent = 1 if intent_score > 60 else 0
        
        # Generate comment
        timeline = random.randint(1, 12)
        comment = random.choice(comment_templates).format(
            property_type=property_type.lower(),
            location=location.lower(),
            family_background=family_background.lower(),
            budget=f"{budget:,}",
            timeline=timeline
        )
        
        # Add intent signals to comments based on the target
        if high_intent == 1 and random.random() < 0.7:  # 70% of high intent leads have explicit signals
            comment += f" {random.choice(high_intent_signals).capitalize()}."
        elif high_intent == 0 and random.random() < 0.5:  # 50% of low intent leads have explicit signals
            comment += f" {random.choice(low_intent_signals).capitalize()}."
        
        # Add data to dictionary
        data['phone_number'].append(phone)
        data['email'].append(email)
        data['credit_score'].append(credit_score)
        data['age_group'].append(age_group)
        data['family_background'].append(family_background)
        data['income'].append(income)
        data['property_type'].append(property_type)
        data['budget'].append(budget)
        data['location'].append(location)
        data['previous_inquiries'].append(previous_inquiries)
        data['time_on_market'].append(time_on_market)
        data['response_time_minutes'].append(response_time_minutes)
        data['comments'].append(comment)
        data['high_intent'].append(high_intent)
    
    # Convert to DataFrame
    df = pd.DataFrame(data)
    
    # Save to CSV
    os.makedirs('../data', exist_ok=True)
    df.to_csv('../data/leads_data.csv', index=False)
    
    print(f"Generated {n_samples} synthetic lead records and saved to '../data/leads_data.csv'")
    
    # Print some statistics
    print("\nData Statistics:")
    print(f"High Intent Leads: {df['high_intent'].sum()} ({df['high_intent'].mean()*100:.1f}%)")
    print(f"Age Group Distribution: {df['age_group'].value_counts(normalize=True).to_dict()}")
    print(f"Family Background Distribution: {df['family_background'].value_counts(normalize=True).to_dict()}")
    
    return df

if __name__ == "__main__":
    generate_synthetic_data()