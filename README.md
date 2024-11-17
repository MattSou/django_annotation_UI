## Overview
We propose a non-standard image annotation User Interface based on the Django API. It can be used to annotate images extracted from videos according to multi-classes labels.

## Getting started
### Requirements
Install the requirements via :
```bash
pip install -r requirements.txt
```

### PostgreSQL database set up

On its latest version, the annotation UI is meant to be used along a PostrgeSQL database, which you have to set up before using the UI.

To install PostrgreSQL on Linux : 
```bash
sudo apt install postgresql
```

You then have to create a user and a password for them.

```bash
psql postrges
```
```sql
CREATE USER username WITH PASSWORD 'password';
```

Then you create a database this user will own.

```sql
CREATE DATABASE annotationdb OWNER username;
\q;
```

Then, in the `annotationUI/settings.py` file, you change it as follows :

```python
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql_psycopg2",
        'NAME': 'annotationdb',
        'USER': 'username',
        'PASSWORD': 'password',
        'HOST': 'localhost',
        'PORT': '5432'
    }
}
``` 


### Database structure
The current database structure is meant to be as follows : 

You can change it but you'll have to change the definition of the models in the `annotationV1/models.py` file.

## Run the annotation UI

```bash
python manage.py runserver
```

## Save the database in a JSON file
```bash
python manage.py dumpdata --output DUMP.json
```
An exemple of such a file is given `example.json`. It also contains the information about admin et permissions in your database (not included in the example file).

## Reset the database
```bash
python reset_db_psql.py
```

## Load existing data
```bash
python manage.py loaddata DATA.json
```
Make sure `DATA.json` is well formated (like `example.json`).
