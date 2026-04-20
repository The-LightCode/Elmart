from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings

class User(AbstractUser):
    # This is the "Level Playing Field" logic
    is_business = models.BooleanField(default=False)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    
    # Business specific info
    business_name = models.CharField(max_length=255, blank=True, null=True)
    business_category = models.CharField(max_length=100, blank=True, null=True)
    location_state = models.CharField(max_length=50, blank=True, null=True)
    seller_type = models.CharField(max_length=20, blank=True, null=True) # Retail/Wholesale
    tagline = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    # Newsletter consent
    newsletter_consent = models.BooleanField(default=False)

    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)

    def __str__(self):
        return self.email if self.email else self.username
    


# 1. THE MAIN PRODUCT (Keep ONLY ONE of these)
class Product(models.Model):
    business = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    stock = models.IntegerField(default=0)
    image = models.ImageField(upload_to='products/', blank=True, null=True) # Thumbnail
    created_at = models.DateTimeField(auto_now_add=True)
    following = models.ManyToManyField(
        "self", 
        related_name="followers", 
        symmetrical=False, 
        blank=True
    )

    def __str__(self):
        return self.name
    
# 2. THE MULTIMEDIA (KEEP THIS)
class ProductMedia(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='media')
    file = models.FileField(upload_to='product_media/')
    
    def __str__(self):
        return f"Media for {self.product.name}"
    
# 3. MESSAGES (KEEP THIS)
class Message(models.Model):

    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    
# models.py
# models.py
class Subscriber(models.Model):
    business = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='subscribers'
    )
    email = models.EmailField()
    date_subscribed = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('business', 'email') # Prevent duplicate subs for same biz

    def __str__(self):
        return f"{self.email} subscribed to {self.business.business_name}"

        




