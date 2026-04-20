from django.shortcuts import render
from django.contrib.auth import authenticate # Make sure this is imported!
from rest_framework.decorators import api_view
# Add this at the top of api/views.py
from rest_framework import viewsets
from django.db.models import Q
from .serializers import MessageSerializer
from .models import Message
from django.db import models 
from .models import Product, ProductMedia
from .models import Product, Message # Ensure you added the Message model earlier
from rest_framework.response import Response
from rest_framework import status
from .models import User
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import generics, permissions
# Add this line at the top
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny # Add this import
from rest_framework.decorators import permission_classes # Add this import
from django.db.models import Avg
from django.db.models import Count

from rest_framework.authtoken.models import Token

from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from api.serializers import BusinessProfileSerializer # Ensure this matches your serializer name
from .serializers import UserSerializer, ProductSerializer, MessageSerializer
from django.db.models import Case, When, Value, IntegerField
# api/views.py
from .models import User, Product, Message, Subscriber  # <--- Add Subscriber here!
import math
from .serializers import ProductSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def signup_user(request):
    data = request.data
    try:

        if User.objects.filter(username=data['email']).exists():
            return Response({"error": "Email already registered"}, status=400)
        # Create the user in the database
        user = User.objects.create_user(
            username=data['email'], # Use email as the login ID
            email=data['email'],
            password=data['password'],
            first_name=data.get('fullName', ''),
            is_business=(data.get('role') == 'business'),
            business_name=data.get('bizName', ''),
            business_category=data.get('bizCat', ''),
            location_state=data.get('location', ''),
            seller_type=data.get('sellerType', 'retail'),
            newsletter_consent=data.get('newsletter', False)
        )
        return Response({"message": "Account created successfully!"}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    from rest_framework.permissions import AllowAny

class LoginView(APIView):
    permission_classes = [AllowAny]
    # ... your login logic

@api_view(['POST']) 
@permission_classes([AllowAny])  
def login_user(request):
    # Now request.data will work properly
    email = request.data.get('email')
    password = request.data.get('password')
    
    user = authenticate(username=email, password=password)

    if user is None:
        print("DEBUG: Authenticate failed - User not found or wrong password")
        return Response({"error": "Invalid credentials"}, status=401)
    
    token, created = Token.objects.get_or_create(user=user)

    if user:
        return Response({
            "token": token.key,
            "message": "Login successful",
            "user": {
                "fullName": user.first_name,
                "role": "business" if getattr(user, 'is_business', False) else "customer",
                "bizName": getattr(user, 'business_name', None)

            }
        }, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Invalid email or password"}, status=status.HTTP_400_BAD_REQUEST)
    
    token, created = Token.objects.get_or_create(user=user)
    return Response({
        "token": token.key, # React needs this!
        "user": { ... }
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    unread_count = Message.objects.filter(receiver=request.user, is_read=False).count()
    notifs = []
    if unread_count > 0:
        notifs.append({
            "id": 1,
            "text": f"You have {unread_count} unread message(s).",
            "is_read": False,
            "time": "Recent"
        })
    return Response(notifs)



@api_view(['POST'])
def add_product(request):
    data = request.data
    # We find the CEO by their email (username)
    try:
        owner = User.objects.get(username=data['email'])
        product = Product.objects.create(
            owner=owner,
            name=data['name'],
            category=data['category'],
            price=data['price'],
            stock=data['stock']
        )
        return Response({"message": "Product added successfully!"}, status=201)
    except Exception as e:
        return Response({"error": str(e)}, status=400)
    



@api_view(['POST'])
def ai_advisor(request):
    user_query = request.data.get('query', '').lower()
    
    # 🧠 SMART LOGIC: Let the AI check your real product database
    if "fair" in user_query or "price" in user_query:
        # AI looks up the product mentioned (e.g., "iphone")
        avg_price = Product.objects.filter(name__icontains="iphone").aggregate(Avg('price'))
        price_val = avg_price['price__avg']
        
        if price_val:
            response = f"Based on El-Mart listings, the average price for an iPhone is ₦{price_val:,.2f}. You can compare your deal against this!"
        else:
            response = "I don't have enough data on that product yet, but usually, a fair price is within 10% of the market average."
    else:
        response = "I'm your El-Mart Advisor. Ask me if a price is fair or what the best-selling items are!"

    return Response({"reply": response})


@api_view(['GET'])
def get_social_feed(request):
    # Fetch posts from all businesses
    posts = Post.objects.all().order_by('-created_at')
    # Serialize and return
    return Response(serialized_data)



@api_view(['GET'])
def search_network(request):
    query = request.query_params.get('q', '')
    if not query:
        return Response([])

    # Search for both businesses and customers
    results = User.objects.filter(
        Q(username__icontains=query) | 
        Q(business_name__icontains=query) |
        Q(business_category__icontains=query)
    ).distinct()[:10] # Limit results for speed

    # Simplified serialization
    data = [{
        "id": u.id,
        "username": u.username,
        "business_name": u.business_name,
        "is_business": u.is_business
    } for u in results]
    
    return Response(data)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_posts(request):
    try:
        products = Product.objects.select_related('business').order_by('-created_at')

        feed_data = []
        for prod in products:
            feed_data.append({
                "id": prod.id,
                "business_id": prod.business.id,
                "business_name": prod.business.business_name or prod.business.username,
                "location_state": prod.business.location_state,
                "tagline": prod.business.tagline,
                "is_followed": False,  # Placeholder until you add User.following
                "name": prod.name,
                "price": str(prod.price),
                "image": prod.image.url if prod.image else None,
                "timestamp": prod.created_at
            })

        return Response(feed_data)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
    
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_business_profile(request):
    # Pass 'partial=True' so we only update the fields sent in the request
    serializer = BusinessProfileSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_follow(request, user_id):
    target_user = get_object_or_404(User, id=user_id)
    me = request.user
    
    if me == target_user:
        return Response({"error": "You cannot follow yourself"}, status=400)

    if target_user in me.following.all():
        me.following.remove(target_user)
        action = "unfollowed"
    else:
        me.following.add(target_user)
        action = "followed"
        
    return Response({
        "action": action,
        "follower_count": target_user.followers.count(),
        "following_count": me.following.count()
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    old_password = request.data.get("old_password")
    new_password = request.data.get("new_password")
    user = request.user
    
    if not user.check_password(old_password):
        return Response({"error": "Current password is incorrect"}, status=400)
    
    user.set_password(new_password)
    user.save()
    return Response({"message": "Password changed"})

# views.py
@api_view(['POST'])
def subscribe_to_newsletter(request, business_id):
    email = request.data.get('email')
    business = get_object_or_404(User, id=business_id)
    
    subscriber, created = Subscriber.objects.get_or_create(
        business=business, 
        email=email
    )
    
    if not created and not subscriber.is_active:
        subscriber.is_active = True
        subscriber.save()
        return Response({"message": "Re-subscribed successfully!"})
    
    return Response({"message": "Subscribed successfully!"}, status=201)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_business_subscribers(request):
    subs = Subscriber.objects.filter(business=request.user, is_active=True)
    data = [{"id": s.id, "email": s.email, "date": s.date_subscribed} for s in subs]
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_business_campaign(request):
    message_content = request.data.get('message')
    if not message_content:
        return Response({"error": "Message content is required"}, status=400)

    # 1. Find all active subscribers for this specific business owner
    subscribers = Subscriber.objects.filter(business=request.user, is_active=True)
    count = subscribers.count()

    # 2. Logic for sending (For now, we log it. Later, connect to Email API)
    print(f"CEO {request.user.business_name} is sending: {message_content} to {count} people.")

    # 3. You can later create a 'Campaign' model to save history
    return Response({
        "message": f"Broadcast successful! Sent to {count} subscribers.",
        "recipient_count": count
    }, status=200)


class ProductCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        # Automatically set the business owner to the logged-in user
        product = serializer.save(business=self.request.user)
        
        # Save multiple media files from request.FILES
        files = self.request.FILES.getlist('media')
        for f in files:
            ProductMedia.objects.create(product=product, file=f)

class BusinessProductListView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
     user = self.request.user
        # If user is not logged in, request.user is AnonymousUser
     if not user.is_authenticated:
        # Return an empty list instead of crashing with a 500 error
         return Product.objects.none()
    
    # Otherwise, filter by the correct field name (business)
     return Product.objects.filter(business=user).order_by('-id')

    def perform_create(self, serializer):
        # Automatically link the product to the logged-in user
        serializer.save(business=self.request.user)

    def list(self, request, *args, **kwargs):
       
       queryset = self.get_queryset()
       serializer = self.get_serializer(queryset, many=True)
        # Note: If your React code expects an array directly, 
        # return 'serializer.data' instead of this dictionary.
       return Response({
            "count": queryset.count(),
            "products": serializer.data
        })
    




def haversine_distance(lat1, lon1, lat2, lon2):
    """Returns distance in km between two GPS coordinates."""
    R = 6371  # Earth radius in km
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (math.sin(d_lat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(d_lon / 2) ** 2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


class BusinessDiscoveryView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        params = request.query_params
        name_query     = params.get('name', '').strip()
        location_query = params.get('location', '').strip()
        product_query  = params.get('product', '').strip()
        lat_param      = params.get('lat', None)
        lng_param      = params.get('lng', None)

        queryset = User.objects.filter(is_business=True).distinct()

        # Filter by business name
        if name_query:
            queryset = queryset.filter(business_name__icontains=name_query)

        # Filter by location state
        if location_query:
            queryset = queryset.filter(
                Q(location_state__icontains=location_query)
            )

        # Filter by product name (businesses that sell matching products)
        if product_query:
            queryset = queryset.filter(products__name__icontains=product_query)

        # Build result list
        results = []
        user_lat = float(lat_param) if lat_param else None
        user_lng = float(lng_param) if lng_param else None

        for biz in queryset:
            # Get matched products for this business
            if product_query:
                matched = list(
                    biz.products.filter(name__icontains=product_query)
                    .values('name', 'price')[:3]
                )
            else:
                matched = list(biz.products.values('name', 'price')[:3])

            # Convert Decimal to str for JSON
            for p in matched:
                p['price'] = str(p['price'])

            entry = {
                'id':                biz.id,
                'business_name':     biz.business_name or biz.username,
                'business_category': biz.business_category,
                'location_state':    biz.location_state,
                'tagline':           biz.tagline,
                'description':       biz.description,
                'latitude':          str(biz.latitude) if biz.latitude else None,
                'longitude':         str(biz.longitude) if biz.longitude else None,
                'matched_products':  matched,
                'distance_km':       None,
            }

            # Calculate proximity if user sent GPS coords AND business has coords
            if user_lat and user_lng and biz.latitude and biz.longitude:
                dist = haversine_distance(
                    user_lat, user_lng,
                    float(biz.latitude), float(biz.longitude)
                )
                entry['distance_km'] = round(dist, 1)

            results.append(entry)

        # Sort: businesses with a known distance come first, closest first
        results.sort(key=lambda x: (x['distance_km'] is None, x['distance_km'] or 0))

        return Response(results)



class BusinessDashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "productCount": user.products.count(),
            "viewCount": user.view_count,
            "messageCount": Message.objects.filter(receiver=user, is_read=False).count(),
            "followerCount": user.followers.count()
        })

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Fetch messages where the user is either sender or receiver
        return Message.objects.filter(
            models.Q(sender=self.request.user) | models.Q(receiver=self.request.user)
        ).order_by('timestamp')

    def perform_create(self, serializer):
        # Automatically set the sender to the logged-in user
        serializer.save(sender=self.request.user)

