"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from api.views import signup_user
from api.views import signup_user, login_user # Add login_user here
from django.conf import settings
from django.conf.urls.static import static
from api import views  # This tells Django where to find your 'views'
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import MessageViewSet
from api.views import get_notifications

router = DefaultRouter()
router.register(r'messages', MessageViewSet, basename='message')





urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/signup/', signup_user), # The address React will send data to
    path('api/login/', login_user),
    path('api/my-products/', views.BusinessProductListView.as_view()),
    path('api/', include(router.urls)),
    path('api/posts/', views.get_posts, name='get_posts'), 
    path('api/profile/update/', views.update_business_profile, name='update_profile'),
    path('api/ai-advisor/', views.ai_advisor, name='ai_advisor'),
    path('api/change-password/', views.change_password, name='change_password'),
    path('api/notifications/',  get_notifications, name='notifications-list'),
    path('api/discover/', views.BusinessDiscoveryView.as_view(), name='discover_businesses'),

     
        # Add 'api/' to the front of these!
    path('api/newsletter/send/', views.send_business_campaign, name='send_campaign'),
    path('api/newsletter/subscribers/', views.get_business_subscribers, name='subscribers_list'),
    path('api/newsletter/subscribe/<int:business_id>/', views.subscribe_to_newsletter, name='subscribe'),

]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

