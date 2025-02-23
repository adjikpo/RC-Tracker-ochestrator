from django.urls import path, include
from rest_framework.routers import DefaultRouter
from tracking.api.views import (
    UserViewSet, LoginView, RefreshTokenView, LogoutView,
    HabitudeViewSet, GroupeViewSet, SectionViewSet,
    SuiviViewSet, ScoreViewSet, SemaineConfigViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'habitudes', HabitudeViewSet)
router.register(r'groupes', GroupeViewSet)
router.register(r'sections', SectionViewSet)
router.register(r'suivis', SuiviViewSet, basename='suivi')
router.register(r'scores', ScoreViewSet)
router.register(r'semaine-configs', SemaineConfigViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('token/', LoginView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', RefreshTokenView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
]