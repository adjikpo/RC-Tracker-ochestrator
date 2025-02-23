from django.db import models
from tracking.utils.current_week import get_current_week

class Score(models.Model):
    groupe = models.ForeignKey('tracking.Groupe', on_delete=models.CASCADE)
    semaine = models.CharField(max_length=7, default=get_current_week)
    score = models.IntegerField(default=0)
    pompes_a_faire = models.IntegerField(default=0)

    class Meta:
        unique_together = ('groupe', 'semaine')

    def __str__(self):
        return f"Score de la Semaine {self.semaine} - {self.groupe} : {self.score} erreurs, {self.pompes_a_faire} pompes"
