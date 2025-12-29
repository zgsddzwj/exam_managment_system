from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, user_profile, user_list, update_user_role
from .admin_views import system_stats

app_name = "users"

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", TokenObtainPairView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("profile/", user_profile, name="profile"),
    path("list/", user_list, name="user_list"),
    path("<int:user_id>/role/", update_user_role, name="update_user_role"),
    path("admin/stats/", system_stats, name="system_stats"),
]

