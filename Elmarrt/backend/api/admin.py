from django.contrib import admin
# 📍 Import your models (make sure these names match your models.py exactly)
from .models import Product, Order, Post, Message

# 👑 Customize how you view things in the dashboard (Optional but helpful)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'stock', 'business') # Cleaned columns
    search_fields = ('name',)                 # Search bar targets name only
    list_filter = ('created_at',)             # Filters items by creation date

class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'product', 'user', 'quantity', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('product__name', 'user__username', 'user__email')
    date_hierarchy = 'created_at'
    list_select_related = ('product', 'user')  # avoids an extra query per row

class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'business', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('title', 'business__business_name')
    list_select_related = ('business',)

# 🚀 Register your models so they show up on your live webpage layout
admin.site.register(Product, ProductAdmin)
admin.site.register(Order, OrderAdmin)
admin.site.register(Post, PostAdmin)
admin.site.register(Message)
