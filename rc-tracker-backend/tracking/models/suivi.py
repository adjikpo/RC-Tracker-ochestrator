from django.utils import timezone
from django.db import models

class Suivi(models.Model):
    user = models.ForeignKey('tracking.User', on_delete=models.CASCADE)
    habitude = models.ForeignKey('tracking.Habitude', on_delete=models.CASCADE)
    date = models.DateField(default=timezone.now)
    status = models.BooleanField(default=False)  # ✅ = True, ❌ = False

    class Meta:
        unique_together = ('user', 'habitude', 'date')

    def __str__(self):
        return f"{self.user.username} - {self.habitude.nom} - {self.date} - {'✅' if self.status else '❌'}"
