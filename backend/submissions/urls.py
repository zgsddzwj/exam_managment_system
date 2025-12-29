from django.urls import path
from .views import (
    test_code,
    submit_code,
    my_submissions,
    submission_detail,
    class_submissions,
    export_grades,
)

app_name = "submissions"

urlpatterns = [
    path("tasks/<int:task_id>/test/", test_code, name="test_code"),
    path("tasks/<int:task_id>/submit/", submit_code, name="submit_code"),
    path("my/", my_submissions, name="my_submissions"),
    path("<int:submission_id>/", submission_detail, name="submission_detail"),
    path("classes/<int:class_id>/", class_submissions, name="class_submissions"),
    path("export/", export_grades, name="export_grades"),
]

