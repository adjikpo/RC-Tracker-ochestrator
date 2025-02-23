from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('moderateur', 'Modérateur'),
        ('utilisateur', 'Utilisateur'),
    ]
    
    role = models.CharField(
        max_length=20, 
        choices=ROLE_CHOICES, 
        default='utilisateur')
    
    # Ajouter related_name pour éviter les conflits
    groupe = models.ForeignKey(
        'tracking.Groupe',
        related_name="tracking_users",  # Nouveau nom pour éviter le conflit
        blank=True,
        null=True,
        on_delete=models.SET_NULL
        
    )
    
    user_permissions = models.ManyToManyField(
        "auth.Permission",
        related_name="tracking_users_permissions",  # Nouveau nom pour éviter le conflit
        blank=True
    )
    def __str__(self):
        return self.username

