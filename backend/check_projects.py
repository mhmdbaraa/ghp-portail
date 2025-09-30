#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'projecttracker.settings')
django.setup()

from projects.models import Project
import requests
import json

def check_projects():
    """Check projects data and API response"""
    print("=== CHECKING PROJECTS ===")
    
    # Check database
    projects = Project.objects.all()
    print(f"Database projects: {projects.count()}")
    for project in projects:
        print(f"  - {project.id}: {project.name} (number: '{project.project_number}')")
    
    # Check API response
    try:
        response = requests.get('http://localhost:8000/api/projects/')
        if response.status_code == 200:
            data = response.json()
            print(f"\nAPI response status: {response.status_code}")
            print(f"API projects count: {len(data.get('results', data))}")
            for project in data.get('results', data):
                print(f"  - {project.get('id')}: {project.get('name')} (number: '{project.get('project_number')}')")
        else:
            print(f"API error: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"API request failed: {e}")

if __name__ == "__main__":
    check_projects()

