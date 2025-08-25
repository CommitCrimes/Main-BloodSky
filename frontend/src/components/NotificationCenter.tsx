import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import {
  IconButton,
  Badge,
  Menu,
  Typography,
  Box,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
  Alert,
  CircularProgress,
  Fade
} from '@mui/material';
import {
  NotificationsNone,
  Notifications,
  NotificationImportant,
  LocalShipping,
  DoneAll,
  PriorityHigh,
  Warning,
  Cancel,
  AccountCircle
} from '@mui/icons-material';
import { NotificationStore } from '../stores/NotificationStore';

const commonStyles = {
  techFont: { fontFamily: 'Share Tech, monospace' },
  techFontBold: { fontFamily: 'Share Tech, monospace', fontWeight: 'bold' },
};

interface NotificationCenterProps {
  notificationStore: NotificationStore;
}

const NotificationCenter: React.FC<NotificationCenterProps> = observer(({ notificationStore }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    notificationStore.fetchNotifications();
    
    const interval = setInterval(() => {
      notificationStore.refreshUnreadCount();
    }, 30000); // 30 sec

    return () => clearInterval(interval);
  }, [notificationStore]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    if (notificationStore.notifications.length === 0) {
      notificationStore.fetchNotifications();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (notificationId: number) => {
    await notificationStore.markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await notificationStore.markAllAsRead();
  };

  const getNotificationIcon = (type: string, priority: string) => {
    switch (type) {
      case 'delivery_request':
        return <LocalShipping color={priority === 'urgent' ? 'error' : 'primary'} />;
      case 'in_transit':
        return <LocalShipping color="info" />;
      case 'delivered':
        return <DoneAll color="success" />;
      case 'cancelled':
        return <Cancel color="error" />;
      case 'accepted_center':
      case 'accepted_dronist':
        return <DoneAll color="success" />;
      case 'refused_center':
      case 'refused_dronist':
        return <Cancel color="error" />;
      case 'stock_alert':
        return <Warning color="warning" />;
      case 'system':
        return <NotificationImportant color="info" />;
      case 'user':
        return <AccountCircle color="primary" />;
      default:
        return <Notifications color="primary" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '#ef4444';
      case 'high':
        return '#f59e0b';
      case 'medium':
        return '#3b82f6';
      case 'low':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffInMinutes <= 1 ? 'À l\'instant' : `Il y a ${diffInMinutes} min`;
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Il y a ${diffInDays}j`;
    }
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          color="inherit"
          onClick={handleClick}
          sx={{ mr: 2 }}
        >
          <Badge badgeContent={notificationStore.unreadCount} color="error">
            {notificationStore.unreadCount > 0 ? (
              <Notifications />
            ) : (
              <NotificationsNone />
            )}
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1,
            minWidth: 400,
            maxWidth: 500,
            maxHeight: 600,
            overflow: 'visible',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #e5e7eb' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={commonStyles.techFontBold}>
              Notifications
            </Typography>
            {notificationStore.unreadCount > 0 && (
              <Button
                size="small"
                startIcon={<DoneAll />}
                onClick={handleMarkAllAsRead}
                sx={{ ...commonStyles.techFont, textTransform: 'none' }}
              >
                Tout marquer comme lu
              </Button>
            )}
          </Box>
          {notificationStore.unreadCount > 0 && (
            <Typography variant="body2" color="textSecondary" sx={commonStyles.techFont}>
              {notificationStore.unreadCount} notification{notificationStore.unreadCount > 1 ? 's' : ''} non lue{notificationStore.unreadCount > 1 ? 's' : ''}
            </Typography>
          )}
        </Box>

        {notificationStore.isLoading ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <CircularProgress size={24} />
            <Typography variant="body2" sx={{ mt: 1, ...commonStyles.techFont }}>
              Chargement...
            </Typography>
          </Box>
        ) : notificationStore.error ? (
          <Box sx={{ p: 2 }}>
            <Alert severity="error" sx={{ '& .MuiAlert-message': commonStyles.techFont }}>
              {notificationStore.error}
            </Alert>
          </Box>
        ) : notificationStore.notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <NotificationsNone sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="textSecondary" sx={commonStyles.techFont}>
              Aucune notification
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 0, maxHeight: 400, overflowY: 'auto' }}>
            {notificationStore.notificationsByPriority.map((notification, index) => (
              <Fade in key={notification.notificationId} timeout={300} style={{ transitionDelay: `${index * 50}ms` }}>
                <ListItem
                  sx={{
                    backgroundColor: notification.isRead ? 'transparent' : 'rgba(25, 118, 210, 0.04)',
                    borderLeft: `4px solid ${getPriorityColor(notification.priority)}`,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                    cursor: 'pointer',
                  }}
                  onClick={() => !notification.isRead && handleMarkAsRead(notification.notificationId)}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getNotificationIcon(notification.type, notification.priority)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            ...commonStyles.techFontBold,
                            fontWeight: notification.isRead ? 'normal' : 'bold',
                          }}
                        >
                          {notification.title}
                        </Typography>
                        {notification.priority === 'urgent' && (
                          <Chip
                            size="small"
                            icon={<PriorityHigh />}
                            label="URGENT"
                            color="error"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          sx={{
                            ...commonStyles.techFont,
                            fontSize: '0.85rem',
                            mb: 0.5,
                          }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          sx={commonStyles.techFont}
                        >
                          {formatTimeAgo(notification.createdAt)}
                        </Typography>
                      </Box>
                    }
                  />
                  {!notification.isRead && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: 'primary.main',
                        ml: 1,
                      }}
                    />
                  )}
                </ListItem>
              </Fade>
            ))}
          </List>
        )}

        {notificationStore.notifications.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Button
                variant="text"
                size="small"
                onClick={() => notificationStore.fetchNotifications(50)}
                sx={{ ...commonStyles.techFont, textTransform: 'none' }}
              >
                Voir plus de notifications
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
});

export default NotificationCenter;