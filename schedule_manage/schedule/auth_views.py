# schedule/auth_views.py
# Authentication endpoints: register, login, me

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.contrib.auth import authenticate


@api_view(['POST'])
@permission_classes([AllowAny])  # Anyone can register (no auth needed)
def register(request):
    """
    Register a new user

    POST /api/auth/register/
    {
        "username": "john",
        "password": "secret123",
        "email": "john@example.com"  (optional)
    }

    Returns:
    {
        "message": "User created successfully",
        "user_id": 1,
        "username": "john",
        "token": "abc123..."  (auto-login after register)
    }
    """
    # Get data from request
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email', '')

    # Validate required fields
    if not username or not password:
        return Response(
            {'error': 'Username and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check if username already exists
    if User.objects.filter(username=username).exists():
        return Response(
            {'error': 'Username already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check password length
    if len(password) < 6:
        return Response(
            {'error': 'Password must be at least 6 characters'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Create the user
    user = User.objects.create_user(
        username=username,
        password=password,
        email=email
    )

    # Create token for auto-login
    token, _ = Token.objects.get_or_create(user=user)

    return Response({
        'message': 'User created successfully',
        'user_id': user.id,
        'username': user.username,
        'token': token.key  # User can start using API immediately
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])  # Anyone can try to login
def login(request):
    """
    Login and get token

    POST /api/auth/login/
    {
        "username": "john",
        "password": "secret123"
    }

    Returns:
    {
        "token": "abc123...",
        "user_id": 1,
        "username": "john"
    }
    """
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {'error': 'Username and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Authenticate user (checks password)
    user = authenticate(username=username, password=password)

    if user is None:
        return Response(
            {'error': 'Invalid username or password'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    # Get or create token
    token, _ = Token.objects.get_or_create(user=user)

    return Response({
        'token': token.key,
        'user_id': user.id,
        'username': user.username
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])  # Must be logged in
def me(request):
    """
    Get current user info (check if token is valid)

    GET /api/auth/me/
    Headers: Authorization: Token abc123...

    Returns:
    {
        "user_id": 1,
        "username": "john",
        "email": "john@example.com"
    }
    """
    user = request.user
    return Response({
        'user_id': user.id,
        'username': user.username,
        'email': user.email
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])  # Must be logged in
def logout(request):
    """
    Logout (delete token)

    POST /api/auth/logout/
    Headers: Authorization: Token abc123...

    This deletes the token, so it can't be used anymore.
    """
    # Delete the user's token
    request.user.auth_token.delete()

    return Response({'message': 'Logged out successfully'})
