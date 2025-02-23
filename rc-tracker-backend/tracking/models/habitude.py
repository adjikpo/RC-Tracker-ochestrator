from django.db import models

class Habitude(models.Model):
    nom = models.CharField(max_length=255)
    ordre = models.IntegerField(default=0)
    created_by = models.ForeignKey('tracking.User', on_delete=models.CASCADE, null=True, blank=True)


    def __str__(self):
        return self.nom