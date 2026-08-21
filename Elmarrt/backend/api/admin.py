from django.contrib import admin
# 📍 Import your models (make sure these names match your models.py exactly)
from .models import Product, Order, Post, Message, FeatureBoost, Shipment

# 👑 Customize how you view things in the dashboard (Optional but helpful)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'stock', 'business') # Cleaned columns
    search_fields = ('name',)                 # Search bar targets name only
    list_filter = ('created_at',)             # Filters items by creation date

class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'product', 'user', 'quantity', 'order_value', 'is_paid', 'status', 'created_at')
    list_filter = ('status', 'is_paid', 'created_at')
    search_fields = ('product__name', 'user__username', 'user__email', 'payment_reference')
    date_hierarchy = 'created_at'
    list_select_related = ('product', 'user')  # avoids an extra query per row
    readonly_fields = ('payment_reference',)   # set by Paystack, shouldn't be hand-edited

    def order_value(self, obj):
        return f"₦{obj.total_price:,.2f}"
    order_value.short_description = 'Order Value'

class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'business', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('title', 'business__business_name')
    list_select_related = ('business',)

class FeatureBoostAdmin(admin.ModelAdmin):
    list_display = ('id', 'product', 'business', 'days', 'amount', 'is_paid', 'created_at')
    list_filter = ('is_paid', 'days', 'created_at')
    search_fields = ('product__name', 'business__business_name', 'payment_reference')
    list_select_related = ('product', 'business')

class ShipmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'carrier_name', 'tracking_number', 'status', 'cost', 'created_at')
    list_filter = ('status', 'carrier_name', 'created_at')
    search_fields = ('tracking_number', 'order__id')

# 🚀 Register your models so they show up on your live webpage layout
admin.site.register(Product, ProductAdmin)
admin.site.register(Order, OrderAdmin)
admin.site.register(Post, PostAdmin)
admin.site.register(Message)
admin.site.register(FeatureBoost, FeatureBoostAdmin)
admin.site.register(Shipment, ShipmentAdmin)
    
