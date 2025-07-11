import subprocess
import os
import sys

def setup_model():
    """Setup the lead scoring model by generating data and training the model."""
    
    print("Setting up lead scoring model...")
    
    # Get the current directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Create necessary directories
    os.makedirs(os.path.join(current_dir, '../data'), exist_ok=True)
    os.makedirs(os.path.join(current_dir, '../model'), exist_ok=True)
    
    # Generate data
    print("\n1. Generating synthetic data...")
    try:
        subprocess.run([sys.executable, os.path.join(current_dir, 'generate_data.py')], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error generating data: {e}")
        return False
    
    # Train model
    print("\n2. Training lead scoring model...")
    try:
        subprocess.run([sys.executable, os.path.join(current_dir, 'train_model.py')], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error training model: {e}")
        return False
    
    print("\nSetup completed successfully!")
    print("You can now run the FastAPI application with 'uvicorn main:app --reload'")
    
    return True

if __name__ == "__main__":
    setup_model()