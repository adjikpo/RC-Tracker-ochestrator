from django.urls import path, include

urlpatterns = [
    path('api/', include('tracking.api.urls')),  # Inclusion des routes API
]
