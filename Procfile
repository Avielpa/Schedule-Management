release: python schedule_manage/manage.py migrate
web: gunicorn --chdir schedule_manage schedule_manage.wsgi
