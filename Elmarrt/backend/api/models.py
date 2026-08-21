from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
from django.utils.text import slugify

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

    # Does this business have a real physical outlet customers can visit, or is
    # it remote/online-only? Shown conspicuously on their storefront + in search.
    has_physical_outlet = models.BooleanField(default=False)

    # Users (customers) following businesses. views.toggle_follow already
    # relies on `me.following` / `target_user.followers` — this field was
    # referenced in code but never actually defined, which is why /api/follow/
    # would have 500'd the moment it was wired up.
    following = models.ManyToManyField(
        "self",
        related_name="followers",
        symmetrical=False,
        blank=True,
    )

    # Simple page-view counter for the business dashboard stats.
    view_count = models.PositiveIntegerField(default=0)

    # Public storefront URL, e.g. elmart.com/store/mama-ngozi-store
    # Nullable so it never blocks existing rows; auto-filled on save() below.
    slug = models.SlugField(max_length=140, unique=True, blank=True, null=True)

    # ── Payout details (Paystack Subaccount, for automatic split payments) ──
    bank_name = models.CharField(max_length=100, blank=True, null=True)
    bank_code = models.CharField(max_length=10, blank=True, null=True)
    account_number = models.CharField(max_length=20, blank=True, null=True)
    account_name = models.CharField(max_length=255, blank=True, null=True)  # returned by Paystack's verification
    paystack_subaccount_code = models.CharField(max_length=100, blank=True, null=True)

    # ── Logistics (Terminal Africa) — pickup address for this business ──
    street_address = models.CharField(max_length=255, blank=True, null=True)
    terminal_address_id = models.CharField(max_length=100, blank=True, null=True)  # cached, avoids recreating on Terminal every time

    def save(self, *args, **kwargs):
        if not self.slug and self.business_name:
            base = slugify(self.business_name)[:120] or f"store-{self.pk or 'new'}"
            candidate = base
            i = 2
            # Ensure uniqueness without colliding with another business's slug
            while User.objects.filter(slug=candidate).exclude(pk=self.pk).exists():
                candidate = f"{base}-{i}"
                i += 1
            self.slug = candidate
        super().save(*args, **kwargs)

    def __str__(self):
        return self.email if self.email else self.username
    


# 1. THE MAIN PRODUCT (Keep ONLY ONE of these)
class Product(models.Model):
    business = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    stock = models.IntegerField(default=0)
    image = models.ImageField(upload_to='products/', blank=True, null=True) # Thumbnail
    weight_kg = models.DecimalField(max_digits=6, decimal_places=2, default=1.0)  # for logistics rate calculation
    created_at = models.DateTimeField(auto_now_add=True)
    following = models.ManyToManyField(
        "self", 
        related_name="followers", 
        symmetrical=False, 
        blank=True
    )

    # ── "Pure software" revenue: paid boosts that push a product higher in search/feed ──
    is_featured = models.BooleanField(default=False)
    featured_until = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return self.name


class FeatureBoost(models.Model):
    """One purchase of a featured-listing boost for a product. 100% platform revenue —
    no subaccount split, unlike Order payments, because this is the business paying
    El-Mart directly, not a customer paying the business."""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='boosts')
    business = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='boosts')
    days = models.PositiveIntegerField(default=7)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_reference = models.CharField(max_length=100, unique=True)
    is_paid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Boost #{self.id} for {self.product.name} ({self.days}d)"
    
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


class Order(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Confirmed', 'Confirmed'),
        ('Shipped', 'Shipped'),
        ('Delivered', 'Delivered'),
        ('Cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='ordered_items')
    quantity = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Payment tracking (Paystack)
    is_paid = models.BooleanField(default=False)
    payment_reference = models.CharField(max_length=100, blank=True, null=True, unique=True)

    # ── Logistics (Terminal Africa) ──
    delivery_address = models.TextField(blank=True, null=True)
    delivery_city = models.CharField(max_length=100, blank=True, null=True)
    terminal_delivery_address_id = models.CharField(max_length=100, blank=True, null=True)
    terminal_parcel_id = models.CharField(max_length=100, blank=True, null=True)
    # base = what Terminal actually charges El-Mart; charged = base + commission markup, what the customer pays
    delivery_fee_base = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    delivery_fee_charged = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    pending_rate_id = models.CharField(max_length=100, blank=True, null=True)  # chosen but not yet booked — booked only after payment succeeds

    @property
    def total_price(self):
        return self.product.price * self.quantity

    def __str__(self):
        return f"Order {self.id} by {self.user.username}"


class Shipment(models.Model):
    """One arranged delivery for an order, booked through Terminal Africa."""
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='shipment')
    terminal_shipment_id = models.CharField(max_length=100, blank=True, null=True)
    rate_id = models.CharField(max_length=100)
    carrier_name = models.CharField(max_length=100, blank=True, null=True)
    tracking_number = models.CharField(max_length=100, blank=True, null=True)
    tracking_url = models.URLField(blank=True, null=True)
    status = models.CharField(max_length=50, default='pending')  # pending/confirmed/in-transit/delivered/cancelled
    cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Shipment for Order #{self.order_id} — {self.status}"

class Post(models.Model):
    business = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posts')
    title = models.CharField(max_length=255)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
                                



