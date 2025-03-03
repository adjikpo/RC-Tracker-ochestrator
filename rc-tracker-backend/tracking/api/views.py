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
            samesite="None",
            path="/"
        )
        response.set_cookie(
            key="refresh_token",
            value=response.data["refresh"],
            httponly=True,
            secure=False,
            samesite="None",
            path="/"
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
            samesite="None",
        )
        return response

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        response = Response({"message": "Déconnecté"}, status=200)
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
    queryset = Suivi.objects.all()
    serializer_class = SuiviSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Suivi.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    def perform_update(self, serializer):
        serializer.save(user=self.request.user)

class ScoreViewSet(viewsets.ModelViewSet):
    queryset = Score.objects.all()
    serializer_class = ScoreSerializer
    permission_classes = [IsAuthenticated]

class SemaineConfigViewSet(viewsets.ModelViewSet):
    queryset = SemaineConfig.objects.all()
    serializer_class = SemaineConfigSerializer
    permission_classes = [IsAuthenticated]

class GroupMembersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, group_id):
        try:
            groupe = Groupe.objects.get(id=group_id)
            membres = User.objects.filter(groupe=groupe)  # Filtrer par le champ ForeignKey groupe
            if request.user not in membres:
                return Response({'error': 'Vous n’êtes pas membre de ce groupe'}, status=status.HTTP_403_FORBIDDEN)
            data = []
            for membre in membres:
                habitudes = Habitude.objects.filter(created_by=membre)
                suivis = Suivi.objects.filter(user=membre)
                data.append({
                    'user': UserSerializer(membre).data,
                    'habitudes': HabitudeSerializer(habitudes, many=True).data,
                    'suivis': SuiviSerializer(suivis, many=True).data
                })
            return Response(data)
        except Groupe.DoesNotExist:
            return Response({'error': 'Groupe non trouvé'}, status=status.HTTP_404_NOT_FOUND)

class GroupScoresView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, group_id):
        try:
            groupe = Groupe.objects.get(id=group_id)
            if request.user not in groupe.membres.all():
                return Response({'error': 'Vous n’êtes pas membre de ce groupe'}, status=status.HTTP_403_FORBIDDEN)
            membres = groupe.membres.all()
            scores = []
            for membre in membres:
                suivis_count = Suivi.objects.filter(user=membre, status=True).count()
                scores.append({'user': membre.username, 'score': suivis_count})
            return Response(scores)
        except Groupe.DoesNotExist:
            return Response({'error': 'Groupe non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        
class UserMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
