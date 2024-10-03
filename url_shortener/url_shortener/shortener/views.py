import hashlib
import time
import string

from django.shortcuts import get_object_or_404, redirect
from rest_framework import status
from django.utils.dateparse import parse_datetime
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.cache import cache  # Import Django Redis cache
from django.utils import timezone
from .models import URL
from django.db import IntegrityError

CACHE_TTL = 60 * 60 * 24  # Cache Time To Live (24 hours)
BASE62_ALPHABET = string.ascii_letters + string.digits

# Function to generate a Base62-encoded string
def base62_encode(number: int) -> str:
    if number == 0:
        return BASE62_ALPHABET[0]
    encoded_string = []
    base = len(BASE62_ALPHABET)
    while number:
        remainder = number % base
        number = number // base
        encoded_string.append(BASE62_ALPHABET[remainder])
    return ''.join(reversed(encoded_string))

# Helper function to create MD5 hash based on user's IP and timestamp
def generate_md5_hash(ip_address: str) -> str:
    # Get the current timestamp
    timestamp = str(time.time())
    
    # Combine the user's IP address and timestamp
    combined_input = ip_address + timestamp
    
    # Generate MD5 hash
    md5_hash = hashlib.md5(combined_input.encode()).hexdigest()
    
    return md5_hash

# Function to generate a short code
def generate_short_code(ip_address: str) -> str:
    # Generate MD5 hash from the IP address and timestamp
    md5_hash = generate_md5_hash(ip_address)
    
    # Convert the first part of the hash to a Base62-encoded string
    hash_number = int(md5_hash[:10], 16)
    
    # Base62 encode the number to get the final short code
    short_code = base62_encode(hash_number)[:7]  # Limiting to 7 characters
    
    return short_code

# Helper to shorten the URL
@api_view(['POST'])
def shorten_url(request):
    original_url = request.data.get('original_url')
    expires_at = request.data.get('expires_at')
    
    if not original_url:
        return Response({"error": "original_url is required"}, status=status.HTTP_400_BAD_REQUEST)

    # If an expiration time is provided, calculate the expiration date
    expiration_date = parse_datetime(expires_at) if expires_at else None

    # Generate a short code using the MD5 hash of the user's IP and timestamp
    ip_address = request.META.get('REMOTE_ADDR', '127.0.0.1')  # Fallback to localhost IP if not available
    short_code = generate_short_code(ip_address)

    # Create or retrieve the URL entry from the database
    url_obj, created = URL.objects.get_or_create(original_url=original_url, defaults={'short_code': short_code, 'expires_at': expiration_date})
    
    # Cache the result in Redis (short_code -> original_url)
    cache.set(url_obj.short_code, original_url, timeout=CACHE_TTL)

    return Response({
        "original_url": url_obj.original_url,
        "short_code": url_obj.short_code,
        "expires_at": url_obj.expires_at
    }, status=status.HTTP_201_CREATED)


# Redirect to the original URL when accessing the short URL
@api_view(['GET'])
def redirect_url(request, short_code):
    # Check Redis cache first
    original_url = cache.get(short_code)

    if original_url:
        return redirect(original_url)
    
    # If not found in cache, query the database
    url_obj = get_object_or_404(URL, short_code=short_code)
    
    # Check if the URL is expired
    if url_obj.expires_at and timezone.now() > url_obj.expires_at:
        return Response({"error": "This URL has expired."}, status=status.HTTP_410_GONE)

    # Cache the URL for faster future access
    cache.set(short_code, url_obj.original_url, timeout=CACHE_TTL)

    # Redirect to the original URL
    return redirect(url_obj.original_url)


@api_view(['DELETE'])
def delete_url(request, short_code):
    try:
        url_obj = URL.objects.get(short_code=short_code)
        url_obj.delete()
        return Response({"message": "URL deleted successfully."}, status=204)
    except URL.DoesNotExist:
        return Response({"error": "URL not found."}, status=404)


@api_view(['PUT'])
def rename_short_code(request, short_code):
    new_short_code = request.data.get('new_short_code')
    
    if not new_short_code:
        return Response({"error": "New shortcode is required."}, status=400)
    
    try:
        url_obj = URL.objects.get(short_code=short_code)
        url_obj.short_code = new_short_code
        url_obj.save()
        return Response({"message": "Shortcode updated successfully."}, status=200)
    except URL.DoesNotExist:
        return Response({"error": "URL not found."}, status=404)
    except IntegrityError:
        return Response({"error": "Shortcode already exists."}, status=400)


@api_view(['GET'])
def get_all_urls(request):
    urls = URL.objects.all()
    url_list = [
        {
            "original_url": url.original_url,
            "short_code": url.short_code,
            "expires_at": url.expires_at
        }
        for url in urls
    ]
    return Response(url_list)
