from rest_framework import serializers
from .models import Product, ProductMedia

from .models import Message
from django.contrib.auth import get_user_model
User = get_user_model()

class ProductMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductMedia
        fields = ['id', 'file']

class ProductSerializer(serializers.ModelSerializer):
    # This links the multimedia gallery to the product
    media = ProductMediaSerializer(many=True, read_only=True)
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Product
        # Added 'media' to the list so it actually sends to the frontend
        fields = ['id', 'name', 'price', 'stock', 'image', 'media']
        read_only_fields = ['business']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'business_name', 'business_category', 'location_state', 'description', 'tagline']



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
