from django.db import models

class Groupe(models.Model):
    numero = models.IntegerField()  # Numéro du groupe (1-10)
    section = models.ForeignKey('tracking.Section', on_delete=models.CASCADE)

    class Meta:
        unique_together = ('numero', 'section')

    def __str__(self):
        return f"Groupe {self.numero} - {self.section.nom}"
