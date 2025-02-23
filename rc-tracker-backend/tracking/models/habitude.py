from django.db import models

class Habitude(models.Model):
    # TYPE_CHOICES = [
    #     ('matin', 'Matin'),
    #     ('soir', 'Soir'),
    #     ('habitude', 'Habitude'),
    # ]

    nom = models.CharField(max_length=255)
    # categorie = models.CharField(max_length=10, choices=TYPE_CHOICES)
    created_by = models.ForeignKey('tracking.User', on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):  
        return self.nom
