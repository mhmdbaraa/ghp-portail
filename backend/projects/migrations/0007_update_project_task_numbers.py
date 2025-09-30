# Generated manually to update project and task numbers

from django.db import migrations
from datetime import datetime


def update_project_numbers(apps, schema_editor):
    """Update existing project numbers to use current year format"""
    Project = apps.get_model('projects', 'Project')
    current_year = datetime.now().year % 100
    
    # Get all projects without proper year format
    projects = Project.objects.filter(
        project_number__startswith='prj-exercice-'
    ).order_by('id')
    
    index = 1
    for project in projects:
        project.project_number = f"prj-{current_year:02d}-{index:02d}"
        project.save()
        index += 1


def update_task_numbers(apps, schema_editor):
    """Update existing task numbers to use current year format"""
    Task = apps.get_model('projects', 'Task')
    current_year = datetime.now().year % 100
    
    # Get all tasks without proper year format
    tasks = Task.objects.filter(
        task_number__startswith='t-exercice-'
    ).order_by('id')
    
    index = 1
    for task in tasks:
        task.task_number = f"t-{current_year:02d}-{index:02d}"
        task.save()
        index += 1


def reverse_update_project_numbers(apps, schema_editor):
    """Reverse the project number update"""
    Project = apps.get_model('projects', 'Project')
    
    # Get all projects with year format and revert to exercice format
    projects = Project.objects.filter(
        project_number__regex=r'^prj-\d{2}-\d{2}$'
    ).order_by('id')
    
    index = 1
    for project in projects:
        project.project_number = f"prj-exercice-{index:04d}"
        project.save()
        index += 1


def reverse_update_task_numbers(apps, schema_editor):
    """Reverse the task number update"""
    Task = apps.get_model('projects', 'Task')
    
    # Get all tasks with year format and revert to exercice format
    tasks = Task.objects.filter(
        task_number__regex=r'^t-\d{2}-\d{2}$'
    ).order_by('id')
    
    index = 1
    for task in tasks:
        task.task_number = f"t-exercice-{index:04d}"
        task.save()
        index += 1


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0006_alter_project_attachments_alter_project_tags_and_more'),
    ]

    operations = [
        migrations.RunPython(
            update_project_numbers,
            reverse_update_project_numbers,
        ),
        migrations.RunPython(
            update_task_numbers,
            reverse_update_task_numbers,
        ),
    ]
