from django.urls import path

from .views import (
    NotificationListCreateView,
    NotificationDetailView,
    NotificationListView,
    MarkNotificationAsReadView,
    MarkAllNotificationsAsReadView,
    DeleteNotificationView,
    UnreadNotificationCountView,
    CriticalNotificationView,
)

urlpatterns = [

    path(
        '',
        NotificationListCreateView.as_view(),
        name='notification-list-create'
    ),

    path(
        'all/',
        NotificationListView.as_view(),
        name='notification-list'
    ),

    path(
        '<uuid:pk>/',
        NotificationDetailView.as_view(),
        name='notification-detail'
    ),

    path(
        '<uuid:pk>/mark-read/',
        MarkNotificationAsReadView.as_view(),
        name='notification-mark-read'
    ),

    path(
        'mark-all-read/',
        MarkAllNotificationsAsReadView.as_view(),
        name='notification-mark-all-read'
    ),

    path(
        '<uuid:pk>/delete/',
        DeleteNotificationView.as_view(),
        name='notification-delete'
    ),

    path(
        'unread-count/',
        UnreadNotificationCountView.as_view(),
        name='notification-unread-count'
    ),

    path(
        'critical/',
        CriticalNotificationView.as_view(),
        name='notification-critical'
    ),
]