# notifications/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework import generics

from .models import Notification
from .permissions import IsNotificationReader
from .serializers import NotificationSerializer


class NotificationListCreateView(generics.ListCreateAPIView):

    serializer_class = NotificationSerializer

    permission_classes = [IsAuthenticated, IsNotificationReader]

    def get_queryset(self):

        queryset = Notification.objects.select_related(
            'user'
        )

        if self.request.user.role == 'admin':

            return queryset

        return queryset.filter(user=self.request.user)

    def perform_create(self, serializer):

        if self.request.user.role == 'admin':

            serializer.save(delivery_status='sent')

            return

        serializer.save(
            user=self.request.user,
            delivery_status='sent',
        )


class NotificationDetailView(generics.RetrieveUpdateDestroyAPIView):

    serializer_class = NotificationSerializer

    permission_classes = [IsAuthenticated, IsNotificationReader]

    def get_queryset(self):

        queryset = Notification.objects.select_related('user')

        if self.request.user.role == 'admin':

            return queryset

        return queryset.filter(user=self.request.user)
    
class NotificationListView(APIView):

    permission_classes = [IsAuthenticated, IsNotificationReader]

    def get(self, request):

        queryset = Notification.objects.select_related('user')

        if request.user.role != 'admin':

            queryset = queryset.filter(user=request.user)

        notifications = queryset.order_by('-created_at')

        serializer = NotificationSerializer(
            notifications,
            many=True,
        )

        return Response(serializer.data, status=status.HTTP_200_OK)


class MarkNotificationAsReadView(APIView):

    permission_classes = [IsAuthenticated, IsNotificationReader]

    def patch(self, request, pk):

        queryset = Notification.objects.filter(id=pk)

        if request.user.role != 'admin':

            queryset = queryset.filter(user=request.user)

        notification = get_object_or_404(queryset)

        notification.is_read = True
        notification.delivery_status = 'read'
        notification.save()

        return Response({
            "message": "Notification marked as read"
        }, status=status.HTTP_200_OK)


class DeleteNotificationView(APIView):

    permission_classes = [IsAuthenticated, IsNotificationReader]

    def delete(self, request, pk):

        queryset = Notification.objects.filter(id=pk)

        if request.user.role != 'admin':

            queryset = queryset.filter(user=request.user)

        notification = get_object_or_404(queryset)

        notification.delete()

        return Response({
            "message": "Notification deleted successfully"
        }, status=status.HTTP_200_OK)


class UnreadNotificationCountView(APIView):

    permission_classes = [IsAuthenticated, IsNotificationReader]

    def get(self, request):

        queryset = Notification.objects.filter(is_read=False)

        if request.user.role != 'admin':

            queryset = queryset.filter(user=request.user)

        unread_count = queryset.count()

        return Response({
            "unread_notifications": unread_count
        }, status=status.HTTP_200_OK)


class CriticalNotificationView(APIView):

    permission_classes = [IsAuthenticated, IsNotificationReader]

    def get(self, request):

        queryset = Notification.objects.filter(priority='critical')

        if request.user.role != 'admin':

            queryset = queryset.filter(user=request.user)

        critical_notifications = queryset.order_by('-created_at')

        serializer = NotificationSerializer(
            critical_notifications,
            many=True,
        )

        return Response(serializer.data, status=status.HTTP_200_OK)


class MarkAllNotificationsAsReadView(APIView):

    permission_classes = [IsAuthenticated, IsNotificationReader]

    def patch(self, request):

        queryset = Notification.objects.filter(
            is_read=False,
        )

        if request.user.role != 'admin':

            queryset = queryset.filter(user=request.user)

        updated_count = queryset.update(
            is_read=True,
            delivery_status='read',
        )

        return Response({
            "message": "Notifications marked as read",
            "updated_count": updated_count,
        }, status=status.HTTP_200_OK)


class NotificationView(NotificationListCreateView):
    """Backward-compatible alias used in existing URL imports."""