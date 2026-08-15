from rest_framework import serializers
from .models import Product, ProductMedia, Order, Post

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
        fields = ['business_name', 'tagline', 'description', 'business_category', 'location_state', 'phone_number',  'latitude', 'longitude']

class MessageSerializer(serializers.ModelSerializer):
    sender_email = serializers.ReadOnlyField(source='sender.email')
    
    class Meta:
        model = Message
        fields = ['id', 'sender', 'sender_email', 'receiver', 'content', 'timestamp', 'is_read']
        read_only_fields = ['sender', 'timestamp']


class BusinessDiscoverySerializer(serializers.ModelSerializer):
    matched_products = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'business_name', 'business_category',
            'location_state', 'tagline', 'description',
            'latitude', 'longitude', 'matched_products'
        ]

    def get_matched_products(self, obj):
        # Pull the product query from the request context if available
        product_query = self.context.get('product_query', None)
        if product_query:
            products = obj.products.filter(name__icontains=product_query)[:3]
        else:
            products = obj.products.all()[:3]
        return [{'name': p.name, 'price': str(p.price)} for p in products]


class OrderSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    product_image = serializers.SerializerMethodField()
    business_id = serializers.ReadOnlyField(source='product.business.id')
    business_name = serializers.SerializerMethodField()
    buyer_name = serializers.SerializerMethodField()
    total_price = serializers.ReadOnlyField()

    class Meta:
        model = Order
        fields = [
            'id', 'product', 'product_name', 'product_image',
            'business_id', 'business_name', 'user', 'buyer_name',
            'quantity', 'status', 'total_price', 'created_at', 'updated_at',
        ]
        read_only_fields = ['user', 'status', 'created_at', 'updated_at']

    def get_product_image(self, obj):
        request = self.context.get('request')
        if obj.product.image and request:
            return request.build_absolute_uri(obj.product.image.url)
        return obj.product.image.url if obj.product.image else None

    def get_business_name(self, obj):
        biz = obj.product.business
        return biz.business_name or biz.username

    def get_buyer_name(self, obj):
        return obj.user.first_name or obj.user.username

    def validate_product(self, product):
        if product.stock <= 0:
            raise serializers.ValidationError("This product is out of stock.")
        return product

    def validate_quantity(self, quantity):
        if quantity < 1:
            raise serializers.ValidationError("Quantity must be at least 1.")
        return quantity


class PostSerializer(serializers.ModelSerializer):
    business_name = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'business', 'business_name', 'title', 'content', 'created_at']
        read_only_fields = ['business']

    def get_business_name(self, obj):
        return obj.business.business_name or obj.business.username
