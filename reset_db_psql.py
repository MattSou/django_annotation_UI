import os
import subprocess
from django.db import connection
from django.conf import settings

settings.configure(DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql_psycopg2",
        'NAME': 'postgres',
        'USER': 'msouda',
        'PASSWORD': '#db=PROJ!',
        'HOST': 'localhost',
        'PORT': '5432'
    }
})

with connection.cursor() as cursor:
    cursor.execute("DROP DATABASE annotationdb;")
    cursor.execute("CREATE DATABASE annotationdb;")



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