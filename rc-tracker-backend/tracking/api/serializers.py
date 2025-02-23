from rest_framework import serializers
from tracking.models import User, Habitude, Groupe, Section, Suivi, Score, SemaineConfig

# Serializer pour User
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'role', 'groupe')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        """Crée un nouvel utilisateur avec mot de passe hashé."""
        user = User.objects.create_user(**validated_data)
        return user

    def update(self, instance, validated_data):
        """Met à jour l'utilisateur, y compris le mot de passe si fourni."""
        password = validated_data.pop('password', None)
        instance = super().update(instance, validated_data)
        if password is not None:
            instance.set_password(password)
            instance.save()
        return instance

# Serializer pour Habitude
class HabitudeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Habitude
        fields = ['id', 'nom', 'ordre', 'created_by']
        read_only_fields = ['created_by']
        
# Serializer pour Groupe
class GroupeSerializer(serializers.ModelSerializer):
    section = serializers.PrimaryKeyRelatedField(queryset=Section.objects.all())

    class Meta:
        model = Groupe
        fields = ('id', 'numero', 'section')

# Serializer pour Section
class SectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = ('id', 'nom')

# Serializer pour Suivi
class SuiviSerializer(serializers.ModelSerializer):
    class Meta:
        model = Suivi
        fields = ('id', 'user', 'habitude', 'date', 'status')
        read_only_fields = ('user',)  # Défini par l’utilisateur connecté

# Serializer pour Score
class ScoreSerializer(serializers.ModelSerializer):
    groupe = serializers.PrimaryKeyRelatedField(queryset=Groupe.objects.all())

    class Meta:
        model = Score
        fields = ('id', 'groupe', 'semaine', 'score', 'pompes_a_faire')

# Serializer pour SemaineConfig
class SemaineConfigSerializer(serializers.ModelSerializer):
    score = serializers.PrimaryKeyRelatedField(queryset=Score.objects.all())

    class Meta:
        model = SemaineConfig
        fields = ('id', 'semaine', 'score', 'modification_habitudes_autorisee', 'habitudes_fixes')