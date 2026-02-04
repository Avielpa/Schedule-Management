from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EventViewSet, SoldierViewSet, SoldierConstraintViewSet,
    SchedulingRunViewSet, AssignmentViewSet
)
from .auth_views import register, login, logout, me  # NEW: Auth endpoints

router = DefaultRouter()

# Simplified endpoints for Event -> Schedule -> Soldiers flow
router.register(r'events', EventViewSet)
router.register(r'soldiers', SoldierViewSet)
router.register(r'soldier-constraints', SoldierConstraintViewSet)
router.register(r'scheduling-runs', SchedulingRunViewSet)
router.register(r'assignments', AssignmentViewSet)

urlpatterns = [
    # Auth endpoints (no token needed for register/login)
    path('auth/register/', register, name='register'),
    path('auth/login/', login, name='login'),
    path('auth/logout/', logout, name='logout'),
    path('auth/me/', me, name='me'),

    # API endpoints (token required)
    path('', include(router.urls)),
]



