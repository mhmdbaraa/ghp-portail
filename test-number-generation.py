#!/usr/bin/env python3
"""
Test script to demonstrate the new project and task number generation
"""

from datetime import datetime

def generate_project_number(existing_projects=None):
    """Generate unique project number in format prj-year-index"""
    if existing_projects is None:
        existing_projects = []
    
    # Get current year (last 2 digits)
    current_year = datetime.now().year % 100
    
    # Get the highest index for projects in current year
    year_projects = [p for p in existing_projects if p.startswith(f"prj-{current_year:02d}-")]
    
    if year_projects:
        # Extract the highest index from existing project numbers
        max_index = 0
        for project in year_projects:
            try:
                # Extract index from project_number like "prj-25-01"
                parts = project.split('-')
                if len(parts) == 3 and parts[2].isdigit():
                    index = int(parts[2])
                    max_index = max(max_index, index)
            except (ValueError, IndexError):
                continue
        next_index = max_index + 1
    else:
        next_index = 1
    
    return f"prj-{current_year:02d}-{next_index:02d}"


def generate_task_number(existing_tasks=None):
    """Generate unique task number in format t-year-index"""
    if existing_tasks is None:
        existing_tasks = []
    
    # Get current year (last 2 digits)
    current_year = datetime.now().year % 100
    
    # Get the highest index for tasks in current year
    year_tasks = [t for t in existing_tasks if t.startswith(f"t-{current_year:02d}-")]
    
    if year_tasks:
        # Extract the highest index from existing task numbers
        max_index = 0
        for task in year_tasks:
            try:
                # Extract index from task_number like "t-25-01"
                parts = task.split('-')
                if len(parts) == 3 and parts[2].isdigit():
                    index = int(parts[2])
                    max_index = max(max_index, index)
            except (ValueError, IndexError):
                continue
        next_index = max_index + 1
    else:
        next_index = 1
    
    return f"t-{current_year:02d}-{next_index:02d}"


def main():
    print("🎯 Test de Génération des Numéros de Projets et Tâches")
    print("=" * 60)
    
    current_year = datetime.now().year % 100
    print(f"Année actuelle: 20{current_year:02d}")
    print()
    
    # Test 1: Génération de nouveaux numéros (base vide)
    print("📋 Test 1: Génération de nouveaux numéros (base vide)")
    print("-" * 50)
    
    for i in range(5):
        project_num = generate_project_number()
        task_num = generate_task_number()
        print(f"Projet {i+1}: {project_num}")
        print(f"Tâche {i+1}:  {task_num}")
        print()
    
    # Test 2: Génération avec des numéros existants
    print("📋 Test 2: Génération avec des numéros existants")
    print("-" * 50)
    
    existing_projects = [
        f"prj-{current_year:02d}-01",
        f"prj-{current_year:02d}-03",
        f"prj-{current_year:02d}-05",
        "prj-24-01",  # Ancien format
        "prj-exercice-001"  # Ancien format
    ]
    
    existing_tasks = [
        f"t-{current_year:02d}-01",
        f"t-{current_year:02d}-02",
        f"t-{current_year:02d}-04",
        "t-24-01",  # Ancien format
        "t-exercice-001"  # Ancien format
    ]
    
    print("Numéros existants:")
    print("Projets:", existing_projects)
    print("Tâches: ", existing_tasks)
    print()
    
    for i in range(3):
        project_num = generate_project_number(existing_projects)
        task_num = generate_task_number(existing_tasks)
        print(f"Nouveau Projet {i+1}: {project_num}")
        print(f"Nouvelle Tâche {i+1}:  {task_num}")
        
        # Ajouter aux listes existantes pour le prochain test
        existing_projects.append(project_num)
        existing_tasks.append(task_num)
        print()
    
    # Test 3: Comparaison avec l'ancien format
    print("📋 Test 3: Comparaison Ancien vs Nouveau Format")
    print("-" * 50)
    
    print("Ancien format:")
    print("  Projets: prj-exercice-0001, prj-exercice-0002, ...")
    print("  Tâches:  t-exercice-0001, t-exercice-0002, ...")
    print()
    
    print("Nouveau format:")
    print(f"  Projets: prj-{current_year:02d}-01, prj-{current_year:02d}-02, ...")
    print(f"  Tâches:  t-{current_year:02d}-01, t-{current_year:02d}-02, ...")
    print()
    
    print("✅ Avantages du nouveau format:")
    print("  • Année visible dans le numéro")
    print("  • Format plus court et lisible")
    print("  • Identification rapide de l'année")
    print("  • Numérotation par année")
    print("  • Compatible avec les systèmes existants")


if __name__ == "__main__":
    main()
