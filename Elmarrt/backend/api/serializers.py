from rest_framework import serializers
from .models import Product, ProductMedia

from .models import Message
from django.contrib.auth import get_user_model

class ProductMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductMedia
        fields = ['id', 'file']

class ProductSerializer(serializers.ModelSerializer):
    # Make image optional so it doesn't cause a 400 error
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'stock', 'image']
        read_only_fields = ['business']


User = get_user_model()

class BusinessProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['business_name', 'tagline', 'description', 'business_category', 'location_state', 'phone_number']

class MessageSerializer(serializers.ModelSerializer):
    sender_email = serializers.ReadOnlyField(source='sender.email')
    
    class Meta:
        model = Message
        fields = ['id', 'sender', 'sender_email', 'receiver', 'content', 'timestamp', 'is_read']
        read_only_fields = ['sender', 'timestamp']
