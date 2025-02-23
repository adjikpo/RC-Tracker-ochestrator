from django.db import models
from tracking.utils.current_week import get_current_week

class SemaineConfig(models.Model):
    semaine = models.CharField(
        max_length=7,
        default=get_current_week 
    )
    score = models.OneToOneField(
        'tracking.Score',
        on_delete=models.CASCADE,
        related_name="config"
    )
    modification_habitudes_autorisee = models.BooleanField(default=False)
    habitudes_fixes = models.IntegerField(default=0)

    def __str__(self):
        return f"Semaine {self.semaine} - Fixes: {self.habitudes_fixes}, Modif: {'✅' if self.modification_habitudes_autorisee else '❌'}"