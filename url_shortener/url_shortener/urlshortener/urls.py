from django.urls import path
from shortener.views import shorten_url, redirect_url, get_all_urls, delete_url, rename_short_code  # Use correct function names

urlpatterns = [
    path('api/urls/', get_all_urls, name='get_all_urls'),  # API to fetch all shortened URLs
    path('api/shorten/', shorten_url, name='shorten_url'),  # POST to shorten URL
    path('<str:short_code>/', redirect_url, name='redirect_url'),  # Redirect using short code
    path('api/url/<str:short_code>/delete/', delete_url, name='delete_url'),  # Delete a specific URL
    path('api/url/<str:short_code>/rename/', rename_short_code, name='rename_short_code'),
]
