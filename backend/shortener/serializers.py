# shortener/serializers.py

from rest_framework import serializers
from .models import URL

class URLSerializer(serializers.ModelSerializer):
    class Meta:
        model = URL
        fields = ['id', 'original_url', 'short_code', 'created_at', 'expires_at']
        read_only_fields = ['id', 'short_code', 'created_at']
