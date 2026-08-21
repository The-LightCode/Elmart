from django.shortcuts import render, get_object_or_404
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
from .models import User, Product, Message, Subscriber, Order, Post, FeatureBoost, Shipment  # <--- Add Subscriber here!
import math
import os
from django.utils import timezone
from datetime import timedelta
from .serializers import ProductSerializer, OrderSerializer, PostSerializer, PublicStoreSerializer

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
    return Response(PostSerializer(posts, many=True).data)



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
        # Expire lapsed boosts before ordering, so paying stops mattering the moment it should
        Product.objects.filter(is_featured=True, featured_until__lt=timezone.now()).update(is_featured=False, featured_until=None)

        products = Product.objects.select_related('business').order_by('-is_featured', '-created_at')

        followed_ids = set()
        if request.user.is_authenticated:
            followed_ids = set(request.user.following.values_list('id', flat=True))

        feed_data = []
        for prod in products:
            feed_data.append({
                "id": prod.id,
                "business_id": prod.business.id,
                "business_name": prod.business.business_name or prod.business.username,
                "location_state": prod.business.location_state,
                "tagline": prod.business.tagline,
                "is_followed": prod.business.id in followed_ids,
                "is_featured": prod.is_featured,
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
            "followerCount": user.followers.count(),
            "orderCount": Order.objects.filter(product__business=user).count(),
            "pendingOrderCount": Order.objects.filter(product__business=user, status='Pending').count(),
        })

class PublicStoreView(APIView):
    """
    Public, no-login storefront — this is what elmart.com/store/<slug>/ resolves to.
    Anyone with the link can view it, including people who've never signed up.
    """
    permission_classes = [AllowAny]

    def get(self, request, slug):
        business = get_object_or_404(User, slug=slug, is_business=True)
        business.view_count = models.F('view_count') + 1
        business.save(update_fields=['view_count'])
        business.refresh_from_db(fields=['view_count'])
        return Response(PublicStoreSerializer(business).data)


import requests

PAYSTACK_SECRET_KEY = os.environ.get('PAYSTACK_SECRET_KEY', '')
PAYSTACK_BASE_URL = 'https://api.paystack.co'


class ListBanksView(APIView):
    """Proxies Paystack's bank list so the frontend can show a real dropdown
    instead of hardcoding Nigerian bank codes."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        headers = {"Authorization": f"Bearer {PAYSTACK_SECRET_KEY}"}
        try:
            r = requests.get(f"{PAYSTACK_BASE_URL}/bank?country=nigeria", headers=headers, timeout=10)
            data = r.json()
        except requests.RequestException:
            return Response({"error": "Could not reach payment provider."}, status=502)
        return Response(data.get('data', []))


class SetupPayoutAccountView(APIView):
    """
    A business submits their bank + account number. We verify the account is
    real via Paystack (catches typos before money is ever involved), then
    create a Paystack Subaccount so future order payments split automatically —
    El-Mart's commission stays behind, the rest settles straight to their bank.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        bank_code = request.data.get('bank_code')
        account_number = request.data.get('account_number')
        bank_name = request.data.get('bank_name', '')
        if not bank_code or not account_number:
            return Response({"error": "bank_code and account_number are required."}, status=400)

        headers = {"Authorization": f"Bearer {PAYSTACK_SECRET_KEY}"}

        # 1. Resolve/verify the account actually exists and belongs to a real bank account
        try:
            resolve = requests.get(
                f"{PAYSTACK_BASE_URL}/bank/resolve",
                params={"account_number": account_number, "bank_code": bank_code},
                headers=headers, timeout=10,
            ).json()
        except requests.RequestException:
            return Response({"error": "Could not reach payment provider."}, status=502)

        if not resolve.get('status'):
            return Response({"error": "Could not verify that account number. Double-check it and try again."}, status=400)

        account_name = resolve['data']['account_name']
        business = request.user

        # 2. Create (or this is their first time — Paystack subaccounts can't easily be "updated"
        #    in place for bank details, so we create fresh each time bank info changes)
        payload = {
            "business_name": business.business_name or business.username,
            "settlement_bank": bank_code,
            "account_number": account_number,
            "percentage_charge": settings.PLATFORM_COMMISSION_PERCENT,
        }
        try:
            r = requests.post(f"{PAYSTACK_BASE_URL}/subaccount", json=payload, headers=headers, timeout=10)
            data = r.json()
        except requests.RequestException:
            return Response({"error": "Could not reach payment provider."}, status=502)

        if not data.get('status'):
            return Response({"error": data.get('message', 'Could not set up payout account.')}, status=400)

        business.bank_code = bank_code
        business.bank_name = bank_name
        business.account_number = account_number
        business.account_name = account_name
        business.paystack_subaccount_code = data['data']['subaccount_code']
        business.save(update_fields=['bank_code', 'bank_name', 'account_number', 'account_name', 'paystack_subaccount_code'])

        return Response({
            "message": f"Payout account set up! Future sales pay out to {account_name} automatically.",
            "account_name": account_name,
            "subaccount_code": business.paystack_subaccount_code,
        })


class InitializePaymentView(APIView):
    """
    Step 1: customer has an unpaid order, wants to pay.
    We ask Paystack to open a transaction and hand back a checkout URL/reference.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get('order_id')
        order = get_object_or_404(Order, id=order_id, user=request.user)

        if order.is_paid:
            return Response({"error": "This order is already paid for."}, status=400)

        headers = {"Authorization": f"Bearer {PAYSTACK_SECRET_KEY}"}
        payload = {
            "email": request.user.email,
            "amount": int((order.total_price + (order.delivery_fee_charged or 0)) * 100),  # Paystack expects kobo, not naira
            "metadata": {"order_id": order.id, "user_id": request.user.id},
            "callback_url": request.data.get('callback_url'),  # frontend page to return to
        }

        # Split automatically to the seller's own bank account, minus El-Mart's commission.
        # If the seller hasn't set up payout details yet, the full amount goes to El-Mart's
        # account instead — nothing breaks, but the seller needs to be paid out manually
        # until they complete setup (visible in Django admin via payment_reference).
        seller_subaccount = order.product.business.paystack_subaccount_code
        if seller_subaccount:
            payload["subaccount"] = seller_subaccount
            payload["bearer"] = "subaccount"  # seller absorbs the Paystack transaction fee, not El-Mart

        try:
            r = requests.post(f"{PAYSTACK_BASE_URL}/transaction/initialize",
                               json=payload, headers=headers, timeout=10)
            data = r.json()
        except requests.RequestException:
            return Response({"error": "Could not reach payment provider. Try again."}, status=502)

        if not data.get('status'):
            return Response({"error": data.get('message', 'Payment initialization failed.')}, status=400)

        reference = data['data']['reference']
        order.payment_reference = reference
        order.save(update_fields=['payment_reference'])

        return Response({
            "authorization_url": data['data']['authorization_url'],
            "access_code": data['data']['access_code'],
            "reference": reference,
        })


class VerifyPaymentView(APIView):
    """
    Step 2: after checkout, confirm payment SERVER-SIDE with Paystack directly.
    Never trust a redirect query param alone — always verify against Paystack's API.
    Handles both order payments and featured-listing boost payments, since both
    redirect through the same /payment-callback page on the frontend.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, reference):
        order = Order.objects.filter(payment_reference=reference, user=request.user).first()
        boost = None
        if not order:
            boost = FeatureBoost.objects.filter(payment_reference=reference, business=request.user).first()

        if not order and not boost:
            return Response({"error": "Payment reference not found."}, status=404)

        if (order and order.is_paid) or (boost and boost.is_paid):
            payload = {"status": "success"}
            if order:
                payload["order"] = OrderSerializer(order, context={'request': request}).data
            else:
                payload["boost"] = {"product_id": boost.product_id, "days": boost.days}
            return Response(payload)

        headers = {"Authorization": f"Bearer {PAYSTACK_SECRET_KEY}"}
        try:
            r = requests.get(f"{PAYSTACK_BASE_URL}/transaction/verify/{reference}",
                              headers=headers, timeout=10)
            data = r.json()
        except requests.RequestException:
            return Response({"error": "Could not reach payment provider. Try again."}, status=502)

        paystack_status = data.get('data', {}).get('status')
        if not (data.get('status') and paystack_status == 'success'):
            return Response({"status": paystack_status or "failed"}, status=400)

        if order:
            order.is_paid = True
            order.status = 'Confirmed'
            order.save(update_fields=['is_paid', 'status', 'updated_at'])
            if order.pending_rate_id:
                _book_shipment(order, order.pending_rate_id, order.delivery_fee_charged)
                order.refresh_from_db()
            return Response({"status": "success", "order": OrderSerializer(order, context={'request': request}).data})
        else:
            boost.is_paid = True
            boost.save(update_fields=['is_paid'])
            product = boost.product
            product.is_featured = True
            product.featured_until = timezone.now() + timedelta(days=boost.days)
            product.save(update_fields=['is_featured', 'featured_until'])
            return Response({"status": "success", "boost": {"product_id": product.id, "days": boost.days}})


class InitializeBoostPaymentView(APIView):
    """
    'Pure software' revenue: a business pays El-Mart directly (no subaccount split —
    this money is El-Mart's, not the seller's) to feature a product higher in
    search/feed for a set number of days.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')
        days = int(request.data.get('days', 7))
        product = get_object_or_404(Product, id=product_id, business=request.user)

        price = settings.FEATURE_BOOST_PRICES.get(days)
        if price is None:
            return Response({"error": f"Choose one of {list(settings.FEATURE_BOOST_PRICES.keys())} days."}, status=400)

        headers = {"Authorization": f"Bearer {PAYSTACK_SECRET_KEY}"}
        payload = {
            "email": request.user.email,
            "amount": int(price * 100),
            "metadata": {"purpose": "boost", "product_id": product.id, "days": days},
            "callback_url": request.data.get('callback_url'),
            # Deliberately NO subaccount here — this is El-Mart's own revenue.
        }
        try:
            r = requests.post(f"{PAYSTACK_BASE_URL}/transaction/initialize",
                               json=payload, headers=headers, timeout=10)
            data = r.json()
        except requests.RequestException:
            return Response({"error": "Could not reach payment provider. Try again."}, status=502)

        if not data.get('status'):
            return Response({"error": data.get('message', 'Payment initialization failed.')}, status=400)

        reference = data['data']['reference']
        FeatureBoost.objects.create(
            product=product, business=request.user, days=days,
            amount=price, payment_reference=reference,
        )
        return Response({
            "authorization_url": data['data']['authorization_url'],
            "reference": reference,
            "price": price,
        })


TERMINAL_BASE_URL = 'https://api.terminal.africa/v1'


def _terminal_headers():
    return {"Authorization": f"Bearer {settings.TERMINAL_API_KEY}", "Content-Type": "application/json"}


def _ensure_business_terminal_address(business):
    """Create (once) and cache a Terminal Address object for this business's pickup location."""
    if business.terminal_address_id:
        return business.terminal_address_id
    payload = {
        "name": business.business_name or business.username,
        "first_name": (business.first_name or business.business_name or business.username or "Business"),
        "last_name": (business.last_name or "Owner"),
        "email": business.email,
        "phone": business.phone_number or "",
        "line1": business.street_address or business.business_name or "Address on file",
        "city": business.location_state or "Lagos",
        "state": business.location_state or "Lagos",
        "country": "NG",
    }
    r = requests.post(f"{TERMINAL_BASE_URL}/addresses", json=payload, headers=_terminal_headers(), timeout=10)
    data = r.json()
    if not data.get('status'):
        raise ValueError(data.get('message', 'Could not register pickup address with Terminal Africa.'))
    business.terminal_address_id = data['data']['address_id']
    business.save(update_fields=['terminal_address_id'])
    return business.terminal_address_id


class GetShippingRatesView(APIView):
    """
    Step 1 of logistics: given an order + a delivery address, ask Terminal Africa
    for available couriers/rates. Every rate returned already has El-Mart's
    delivery-fee commission (DELIVERY_MARKUP_PERCENT) baked into 'charged_amount' —
    that's the "delivery fee margin" revenue line from the handbook, applied here.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order = get_object_or_404(
            Order.objects.filter(models.Q(user=request.user) | models.Q(product__business=request.user)),
            id=request.data.get('order_id'),
        )
        delivery_address = request.data.get('delivery_address')
        delivery_city = request.data.get('delivery_city')
        delivery_state = request.data.get('delivery_state', delivery_city)

        if not delivery_address or not delivery_city:
            return Response({"error": "delivery_address and delivery_city are required."}, status=400)

        try:
            pickup_address_id = _ensure_business_terminal_address(order.product.business)
        except ValueError as e:
            return Response({"error": str(e)}, status=502)

        headers = _terminal_headers()

        # Create (or reuse) the delivery address for this order
        if not order.terminal_delivery_address_id:
            addr_payload = {
                "name": request.user.get_full_name() or request.user.username,
                "first_name": request.user.first_name or request.user.username,
                "last_name": request.user.last_name or "Customer",
                "email": request.user.email,
                "phone": request.user.phone_number or "",
                "line1": delivery_address,
                "city": delivery_city,
                "state": delivery_state,
                "country": "NG",
            }
            r = requests.post(f"{TERMINAL_BASE_URL}/addresses", json=addr_payload, headers=headers, timeout=10)
            data = r.json()
            if not data.get('status'):
                return Response({"error": data.get('message', 'Could not register delivery address.')}, status=400)
            order.terminal_delivery_address_id = data['data']['address_id']
            order.delivery_address = delivery_address
            order.delivery_city = delivery_city
            order.save(update_fields=['terminal_delivery_address_id', 'delivery_address', 'delivery_city'])

        # Create (or reuse) the parcel for this order
        # NOTE: verify this payload shape against Terminal's Postman collection —
        # the exact required fields for `items` weren't fully confirmed at build time.
        if not order.terminal_parcel_id:
            parcel_payload = {
                "packaging": settings.TERMINAL_DEFAULT_PACKAGING_ID,
                "weight_unit": "kg",
                "items": [{
                    "name": order.product.name,
                    "description": order.product.name,
                    "quantity": order.quantity,
                    "weight": float(order.product.weight_kg),
                    "value": float(order.product.price),
                }],
            }
            r = requests.post(f"{TERMINAL_BASE_URL}/parcels", json=parcel_payload, headers=headers, timeout=10)
            data = r.json()
            if not data.get('status'):
                return Response({"error": data.get('message', 'Could not create parcel for shipment.')}, status=400)
            order.terminal_parcel_id = data['data']['parcel_id']
            order.save(update_fields=['terminal_parcel_id'])

        # Get rates
        r = requests.get(f"{TERMINAL_BASE_URL}/rates/shipment", headers=headers, params={
            "parcel_id": order.terminal_parcel_id,
            "pickup_address": pickup_address_id,
            "delivery_address": order.terminal_delivery_address_id,
        }, timeout=15)
        data = r.json()
        if not data.get('status'):
            return Response({"error": data.get('message', 'Could not fetch shipping rates.')}, status=400)

        markup = 1 + (settings.DELIVERY_MARKUP_PERCENT / 100)
        rates = [{
            "rate_id": rt.get('id'),
            "carrier_name": rt.get('carrier_name'),
            "carrier_logo": rt.get('carrier_logo'),
            "delivery_time": rt.get('delivery_time'),
            "base_amount": rt.get('amount'),
            "charged_amount": round(rt.get('amount', 0) * markup, 2),  # what the customer actually pays
        } for rt in data.get('data', [])]

        return Response({"rates": rates})


def _book_shipment(order, rate_id, charged_amount):
    """Actually books the courier with Terminal Africa. Called only after payment
    succeeds, so El-Mart never pays Terminal for an abandoned/unpaid checkout."""
    headers = _terminal_headers()
    r = requests.post(f"{TERMINAL_BASE_URL}/shipments", json={"rate_id": rate_id}, headers=headers, timeout=15)
    data = r.json()
    if not data.get('status'):
        return None  # payment still succeeded even if booking fails — don't blow up verify()

    shipment_data = data['data']
    extras = shipment_data.get('shipment_extras', {}) or {}
    shipment, _ = Shipment.objects.update_or_create(
        order=order,
        defaults={
            "terminal_shipment_id": shipment_data.get('id'),
            "rate_id": rate_id,
            "carrier_name": shipment_data.get('carrier', {}).get('name') if isinstance(shipment_data.get('carrier'), dict) else None,
            "tracking_number": extras.get('tracking_number'),
            "tracking_url": extras.get('tracking_url') or extras.get('carrier_tracking_url'),
            "status": shipment_data.get('status', 'confirmed'),
            "cost": charged_amount,
        }
    )
    order.delivery_fee_charged = charged_amount
    order.pending_rate_id = None
    order.save(update_fields=['delivery_fee_charged', 'pending_rate_id'])
    return shipment


class SelectShipmentRateView(APIView):
    """
    A business/customer picks a rate before payment. We DON'T book it with Terminal
    yet — we just remember the choice on the order — so El-Mart never pays for a
    courier on an order that never gets paid for. Booking happens automatically
    in VerifyPaymentView once payment actually succeeds.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order = get_object_or_404(Order, id=request.data.get('order_id'))
        rate_id = request.data.get('rate_id')
        charged_amount = request.data.get('charged_amount')
        if not rate_id:
            return Response({"error": "rate_id is required."}, status=400)

        order.pending_rate_id = rate_id
        order.delivery_fee_charged = charged_amount  # used to compute the payment amount
        order.save(update_fields=['pending_rate_id', 'delivery_fee_charged'])
        return Response({"message": "Delivery option selected. It'll be booked once payment is confirmed."})


class TrackShipmentView(APIView):
    """Pulls the latest status from Terminal Africa for both customer and business to see."""
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        shipment = get_object_or_404(Shipment, order_id=order_id)
        # Access check: only the buyer or the selling business can view tracking
        order = shipment.order
        if request.user not in (order.user, order.product.business):
            return Response({"error": "Not authorized to view this shipment."}, status=403)

        if shipment.terminal_shipment_id:
            headers = _terminal_headers()
            try:
                r = requests.get(f"{TERMINAL_BASE_URL}/shipments/{shipment.terminal_shipment_id}", headers=headers, timeout=10)
                data = r.json()
                if data.get('status'):
                    shipment.status = data['data'].get('status', shipment.status)
                    shipment.save(update_fields=['status', 'updated_at'])
            except requests.RequestException:
                pass  # fall back to whatever we last knew

        return Response({
            "carrier_name": shipment.carrier_name,
            "tracking_number": shipment.tracking_number,
            "tracking_url": shipment.tracking_url,
            "status": shipment.status,
            "cost": shipment.cost,
        })


class CreateOrderView(generics.CreateAPIView):
    """Customer places an order (checkout) for a product."""
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        product = serializer.validated_data['product']
        quantity = serializer.validated_data.get('quantity', 1)
        order = serializer.save(user=self.request.user)
        # Decrement stock so the same item can't be oversold
        product.stock = max(0, product.stock - quantity)
        product.save(update_fields=['stock'])
        return order


class MyOrdersView(generics.ListAPIView):
    """Customer: orders I've placed."""
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).select_related('product', 'product__business').order_by('-created_at')

    def get_serializer_context(self):
        return {'request': self.request}


class BusinessOrdersView(generics.ListAPIView):
    """Business: orders placed on my products."""
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(product__business=self.request.user).select_related('product', 'user').order_by('-created_at')

    def get_serializer_context(self):
        return {'request': self.request}


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_order_status(request, order_id):
    """Business updates the status of an order on one of their products."""
    order = get_object_or_404(Order, id=order_id, product__business=request.user)
    new_status = request.data.get('status')
    valid_statuses = dict(Order.STATUS_CHOICES)
    if new_status not in valid_statuses:
        return Response({"error": f"Status must be one of {list(valid_statuses)}"}, status=400)
    order.status = new_status
    order.save(update_fields=['status', 'updated_at'])
    return Response(OrderSerializer(order, context={'request': request}).data)


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

