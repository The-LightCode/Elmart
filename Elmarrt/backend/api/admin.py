from django.contrib import admin
# 📍 Import your models (make sure these names match your models.py exactly)
from .models import Product, Order, Post, Message 

# 👑 Customize how you view things in the dashboard (Optional but helpful)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'stock', 'category') # Columns you see in the list
    search_fields = ('name', 'category')                  # Adds a search bar for products
    list_filter = ('category',)                           # Adds a sidebar filter

class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'product', 'quantity', 'status')
    list_filter = ('status',)

# 🚀 Register your models so they show up on your live webpage layout
admin.site.register(Product, ProductAdmin)
admin.site.register(Order, OrderAdmin)
admin.site.register(Post)
admin.site.register(Message)
