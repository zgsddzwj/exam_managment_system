from django.urls import path
from .views import (
    ClassListCreateView,
    ClassDetailView,
    create_invitation_code,
    join_class,
    my_classes,
)

app_name = "classes"

urlpatterns = [
    path("", ClassListCreateView.as_view(), name="class_list_create"),
    path("my/", my_classes, name="my_classes"),
    path("<int:pk>/", ClassDetailView.as_view(), name="class_detail"),
    path("<int:class_id>/invitation/", create_invitation_code, name="create_invitation"),
    path("join/", join_class, name="join_class"),
]

