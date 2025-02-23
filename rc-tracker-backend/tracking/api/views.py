from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework import status
from django.contrib.auth import logout
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from tracking.models import User, Habitude, Groupe, Section, Suivi, Score, SemaineConfig
from tracking.api.serializers import (
    UserSerializer, HabitudeSerializer, GroupeSerializer, 
    SectionSerializer, SuiviSerializer, ScoreSerializer, 
    SemaineConfigSerializer
)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

class LoginView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        response.set_cookie(
            key="access_token",
            value=response.data["access"],
            httponly=True,
            secure=False,  # False en dev
            samesite="Lax"
        )
        response.set_cookie(
            key="refresh_token",
            value=response.data["refresh"],
            httponly=True,
            secure=False,
            samesite="Lax"
        )
        return response

class RefreshTokenView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        response.set_cookie(
            key="access_token",
            value=response.data["access"],
            httponly=True,
            secure=False,
            samesite="Lax"
        )
        return response

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        response = Response({"message": "Déconnecté"}, status=status.HTTP_200_OK)
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        logout(request)
        return response

class HabitudeViewSet(viewsets.ModelViewSet):
    queryset = Habitude.objects.all()
    serializer_class = HabitudeSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class GroupeViewSet(viewsets.ModelViewSet):
    queryset = Groupe.objects.all()
    serializer_class = GroupeSerializer
    permission_classes = [IsAuthenticated]

class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    permission_classes = [IsAuthenticated]

class SuiviViewSet(viewsets.ModelViewSet):
    queryset = Suivi.objects.all()  # Ajouté pour le router
    serializer_class = SuiviSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Retourne uniquement les suivis de l’utilisateur connecté."""
        return Suivi.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """Associe automatiquement l’utilisateur connecté au suivi créé."""
        serializer.save(user=self.request.user)

class ScoreViewSet(viewsets.ModelViewSet):
    queryset = Score.objects.all()
    serializer_class = ScoreSerializer
    permission_classes = [IsAuthenticated]

class SemaineConfigViewSet(viewsets.ModelViewSet):
    queryset = SemaineConfig.objects.all()
    serializer_class = SemaineConfigSerializer
    permission_classes = [IsAuthenticated]