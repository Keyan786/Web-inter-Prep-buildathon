#!/usr/bin/env python3
"""
Database initialization script for Resume Builder
Run this script to create the new ResumeData table
"""

from app import app, db

def initialize_db():
    """Initialize database tables"""
    with app.app_context():
        try:
            # Create all tables
            db.create_all()
            print("✅ Database tables created successfully!")
            print("✅ ResumeData table is ready to use")
            print("\nYou can now access the AI Resume Builder at:")
            print("http://localhost:5000/resume_builder")
        except Exception as e:
            print(f"❌ Error creating database tables: {e}")
            return False
    
    return True

if __name__ == '__main__':
    print("🚀 Initializing database for AI Resume Builder...")
    print("-" * 50)
    
    if initialize_db():
        print("\n" + "=" * 50)
        print("Setup complete! The AI Resume Builder is ready to use.")
        print("=" * 50)
    else:
        print("\n❌ Setup failed. Please check the error messages above.")
