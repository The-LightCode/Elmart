from django.contrib import admin
# 📍 Import your models (make sure these names match your models.py exactly)
from .models import Product, Order, Post, Message 

# 👑 Customize how you view things in the dashboard (Optional but helpful)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'stock') # Cleaned columns 
    search_fields = ('name',)                 # Search bar targets name only
    list_filter = ('created_at',)             # Filters items by creation date

class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'product', 'quantity', 'status')
    list_filter = ('status',)

# 🚀 Register your models so they show up on your live webpage layout
admin.site.register(Product, ProductAdmin)
admin.site.register(Order, OrderAdmin)
admin.site.register(Post)
admin.site.register(Message)
