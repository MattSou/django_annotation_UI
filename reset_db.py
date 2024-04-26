import os
import subprocess

os.remove('db.sqlite3')
for file in os.listdir("annotationv1/__pycache__"):
    os.remove("annotationv1/__pycache__/"+file)
os.removedirs("annotationv1/__pycache__")
for file in os.listdir("annotationv1/migrations/__pycache__"):
    os.remove("annotationv1/migrations/__pycache__/"+file)
os.removedirs("annotationv1/migrations/__pycache__")
list_migration = os.listdir("annotationv1/migrations")
list_migration.remove("__init__.py")
for migration in list_migration:
    os.remove("annotationv1/migrations/"+migration)

subprocess.call(["python", "manage.py", "makemigrations"])
subprocess.call(["python", "manage.py", "migrate"])