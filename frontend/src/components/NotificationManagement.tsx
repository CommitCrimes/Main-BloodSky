import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  Chip,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  Fade,
  Stack,
  Badge,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import {
  NotificationsNone,
  Notifications,
  NotificationImportant,
  LocalShipping,
  DoneAll,
  Cancel,
  Warning,
  Refresh,
  Search,
  Done,
  AccountCircle,
  Inventory2
} from '@mui/icons-material';
import { NotificationStore } from '../stores/NotificationStore';

const commonStyles = {
  fontFamily: 'Share Tech, monospace',
  borderRadius: '12px',
  techFont: { fontFamily: 'Share Tech, monospace' },
  techFontBold: { fontFamily: 'Share Tech, monospace', fontWeight: 'bold' },
  glassmorphism: {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    borderRadius: '24px',
  },
  headerGlass: {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '24px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
  },
  gradientText: {
    background: 'linear-gradient(45deg, #981A0E, #C41E3A)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  backgroundGradient: 'linear-gradient(135deg, #e3f8fe 0%, #f0f9ff 100%)',
  buttonBase: {
    fontFamily: 'Share Tech, monospace',
    borderRadius: '12px',
    px: 3,
    py: 1.5,
    textTransform: 'none' as const
  }
};

interface NotificationManagementProps {
  notificationStore: NotificationStore;
}

const NotificationManagement: React.FC<NotificationManagementProps> = observer(({ notificationStore }) => {
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRead, setFilterRead] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    notificationStore.fetchNotifications();
  }, [notificationStore]);

  const getNotificationIcon = (type: string, priority: string) => {
    switch (type) {
      case 'delivery_request':
        return <LocalShipping color={priority === 'urgent' ? 'error' : 'primary'} />;
      case 'in_transit':
        return <LocalShipping color="info" />;
      case 'charged':
        return <Inventory2 sx={{ color: '#3b82f6' }} />;
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

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'Urgent';
      case 'high':
        return 'Élevée';
      case 'medium':
        return 'Moyenne';
      case 'low':
        return 'Faible';
      default:
        return 'Inconnu';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'delivery_request':
        return 'Demande de livraison';
      case 'in_transit':
        return 'Livraison en cours';
      case 'charged':
        return 'Livraison chargée';
      case 'delivered':
        return 'Livraison effectuée';
      case 'cancelled':
        return 'Livraison annulée';
      case 'accepted_center':
        return 'Demande acceptée par le centre';
      case 'refused_center':
        return 'Demande refusée par le centre';
      case 'accepted_dronist':
        return 'Livraison acceptée par le droniste';
      case 'refused_dronist':
        return 'Livraison refusée par le droniste';
      case 'stock_alert':
        return 'Alerte de stock';
      case 'system':
        return 'Système';
      case 'user':
        return 'Notification utilisateur';
      default:
        return 'Autre';
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

  const filteredNotifications = notificationStore.notifications.filter(notification => {
    const matchesPriority = filterPriority === 'all' || notification.priority === filterPriority;
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesRead = filterRead === 'all' ||
      (filterRead === 'read' && notification.isRead) ||
      (filterRead === 'unread' && !notification.isRead);
    const matchesSearch = searchTerm === '' ||
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesPriority && matchesType && matchesRead && matchesSearch;
  });

  const handleMarkAsRead = async (notificationId: number) => {
    await notificationStore.markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await notificationStore.markAllAsRead();
  };

  const handleRefresh = async () => {
    await notificationStore.fetchNotifications();
  };

  if (notificationStore.isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: commonStyles.backgroundGradient,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Paper sx={{ p: 4, textAlign: 'center', ...commonStyles.glassmorphism }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h6" sx={commonStyles.techFont}>
            Chargement des notifications...
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: commonStyles.backgroundGradient,
        p: { xs: 2, md: 4 }
      }}
    >
      <Fade in timeout={800}>
        <Paper
          elevation={0}
          sx={{
            ...commonStyles.headerGlass,
            p: { xs: 3, md: 4 },
            mb: 4,
            textAlign: 'center'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
            <Badge badgeContent={notificationStore.unreadCount} color="error">
              <Notifications sx={{ fontSize: 40, color: '#981A0E' }} />
            </Badge>
            <Typography
              variant="h1"
              sx={{
                color: '#981A0E',
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
                fontFamily: 'Iceland, cursive',
                ...commonStyles.gradientText
              }}
            >
              Notifications
            </Typography>
          </Box>
          <Typography
            variant="subtitle1"
            sx={{
              color: '#5C7F9B',
              ...commonStyles.techFont,
              opacity: 0.8,
              fontSize: { xs: '0.9rem', md: '1.1rem' }
            }}
          >
            {notificationStore.unreadCount > 0
              ? `${notificationStore.unreadCount} notification${notificationStore.unreadCount > 1 ? 's' : ''} non lue${notificationStore.unreadCount > 1 ? 's' : ''}`
              : 'Toutes les notifications sont lues'
            }
          </Typography>
        </Paper>
      </Fade>

      {/* Affichage des erreurs */}
      {notificationStore.error && (
        <Fade in timeout={600}>
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: '16px',
              '& .MuiAlert-message': commonStyles.techFont
            }}
            onClose={() => notificationStore.clearError()}
          >
            {notificationStore.error}
          </Alert>
        </Fade>
      )}

      {/* Actions et filtres */}
      <Fade in timeout={1000}>
        <Paper
          elevation={0}
          sx={{
            ...commonStyles.glassmorphism,
            p: 3,
            mb: 3
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'column', md: 'row' }} spacing={{ xs: 2, md: 3 }} alignItems={{ xs: 'stretch', md: 'center' }}>
            <TextField
              placeholder="Rechercher dans les notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
              sx={{
                flex: { md: 1 },
                '& .MuiInputBase-root': {
                  borderRadius: commonStyles.borderRadius,
                  ...commonStyles.techFont,
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                },
                '& .MuiInputBase-input': {
                  ...commonStyles.techFont,
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }
              }}
              slotProps={{
                input: {
                  startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
                }
              }}
            />

            <FormControl sx={{ minWidth: { xs: '100%', md: 120 } }}>
              <InputLabel sx={{ ...commonStyles.techFont, fontSize: { xs: '0.9rem', sm: '1rem' } }}>Priorité</InputLabel>
              <Select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                label="Priorité"
                sx={{
                  borderRadius: commonStyles.borderRadius,
                  ...commonStyles.techFont
                }}
              >
                <MenuItem value="all">Toutes</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
                <MenuItem value="high">Élevée</MenuItem>
                <MenuItem value="medium">Moyenne</MenuItem>
                <MenuItem value="low">Faible</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: { xs: '100%', md: 120 } }}>
              <InputLabel sx={commonStyles.techFont}>Type</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="Type"
                sx={{
                  borderRadius: commonStyles.borderRadius,
                  ...commonStyles.techFont
                }}
              >
                <MenuItem value="all">Tous</MenuItem>
                <MenuItem value="delivery_request">Demande</MenuItem>
                <MenuItem value="in_transit">En transit</MenuItem>
                <MenuItem value="charged">Chargée</MenuItem>
                <MenuItem value="delivered">Livrée</MenuItem>
                <MenuItem value="cancelled">Annulée</MenuItem>
                <MenuItem value="accepted_center">Acceptée centre</MenuItem>
                <MenuItem value="refused_center">Refusée centre</MenuItem>
                <MenuItem value="accepted_dronist">Acceptée droniste</MenuItem>
                <MenuItem value="refused_dronist">Refusée droniste</MenuItem>
                <MenuItem value="stock_alert">Alerte</MenuItem>
                <MenuItem value="system">Système</MenuItem>
                <MenuItem value="user">Utilisateur</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: { xs: '100%', md: 120 } }}>
              <InputLabel sx={commonStyles.techFont}>Statut</InputLabel>
              <Select
                value={filterRead}
                onChange={(e) => setFilterRead(e.target.value)}
                label="Statut"
                sx={{
                  borderRadius: commonStyles.borderRadius,
                  ...commonStyles.techFont
                }}
              >
                <MenuItem value="all">Toutes</MenuItem>
                <MenuItem value="unread">Non lues</MenuItem>
                <MenuItem value="read">Lues</MenuItem>
              </Select>
            </FormControl>

            <Stack direction="row" spacing={1}>
              <Tooltip title="Actualiser">
                <IconButton onClick={handleRefresh} sx={{ color: '#008EFF' }}>
                  <Refresh />
                </IconButton>
              </Tooltip>
              {notificationStore.unreadCount > 0 && (
                <Button
                  variant="contained"
                  startIcon={<DoneAll />}
                  onClick={handleMarkAllAsRead}
                  size="small"
                  sx={{
                    ...commonStyles.buttonBase,
                    backgroundColor: '#10b981',
                    '&:hover': { backgroundColor: '#059669' },
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    px: { xs: 2, sm: 3 },
                    py: { xs: 1, sm: 1.5 }
                  }}
                >
                  {notificationStore.unreadCount > 5 ? 'Tout lire' : 'Tout marquer comme lu'}
                </Button>
              )}
            </Stack>
          </Stack>
        </Paper>
      </Fade>

      {/* Liste des notifications */}
      <Fade in timeout={1200}>
        <Paper
          elevation={0}
          sx={{
            ...commonStyles.glassmorphism,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {filteredNotifications.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <NotificationsNone sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" sx={commonStyles.techFont} color="textSecondary">
                {searchTerm || filterPriority !== 'all' || filterType !== 'all' || filterRead !== 'all'
                  ? 'Aucune notification ne correspond aux filtres'
                  : 'Aucune notification'
                }
              </Typography>
            </Box>
          ) : (
            <List sx={{
              py: 0
            }}>
              {filteredNotifications.map((notification, index) => (
                <Fade in key={notification.notificationId} timeout={300} style={{ transitionDelay: `${index * 50}ms` }}>
                  <ListItem
                    sx={{
                      backgroundColor: notification.isRead ? 'transparent' : 'rgba(25, 118, 210, 0.04)',
                      borderLeft: `4px solid ${getPriorityColor(notification.priority)}`,
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      },
                      py: { xs: 1.5, md: 2 },
                      px: { xs: 2, md: 3 },
                      borderBottom: index < filteredNotifications.length - 1 ? '1px solid rgba(0, 0, 0, 0.08)' : 'none',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'flex-start', sm: 'center' }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: { xs: 40, sm: 60 }, alignSelf: { xs: 'flex-start', sm: 'center' } }}>
                      {getNotificationIcon(notification.type, notification.priority)}
                    </ListItemIcon>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                        <Typography
                          variant="h6"
                          sx={{
                            ...commonStyles.techFontBold,
                            fontWeight: notification.isRead ? 'normal' : 'bold',
                            fontSize: { xs: '0.95rem', sm: '1.1rem' }
                          }}
                        >
                          {notification.title}
                        </Typography>
                        <Chip
                          size="small"
                          label={getPriorityLabel(notification.priority)}
                          sx={{
                            backgroundColor: getPriorityColor(notification.priority),
                            color: 'white',
                            fontSize: { xs: '0.6rem', sm: '0.7rem' },
                            height: { xs: 18, sm: 20 }
                          }}
                        />
                        <Chip
                          size="small"
                          label={getTypeLabel(notification.type)}
                          variant="outlined"
                          sx={{
                            fontSize: { xs: '0.6rem', sm: '0.7rem' },
                            height: { xs: 18, sm: 20 }
                          }}
                        />
                      </Box>
                      <Typography
                        variant="body1"
                        sx={{
                          ...commonStyles.techFont,
                          mb: 1,
                          color: 'text.primary',
                          fontSize: { xs: '0.85rem', sm: '1rem' },
                          lineHeight: { xs: 1.3, sm: 1.5 }
                        }}
                      >
                        {notification.message}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        sx={{
                          ...commonStyles.techFont,
                          fontSize: { xs: '0.75rem', sm: '0.8rem' }
                        }}
                      >
                        {formatTimeAgo(notification.createdAt)}
                      </Typography>
                    </Box>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mt: { xs: 2, sm: 0 },
                      ml: { xs: 0, sm: 'auto' },
                      alignSelf: { xs: 'flex-end', sm: 'center' },
                      width: { xs: '100%', sm: 'auto' },
                      justifyContent: { xs: 'flex-end', sm: 'center' }
                    }}>
                      {!notification.isRead && (
                        <Tooltip title="Marquer comme lu">
                          <IconButton
                            onClick={() => handleMarkAsRead(notification.notificationId)}
                            sx={{
                              color: '#10b981',
                              p: { xs: 1, sm: 1.5 }
                            }}
                            size={notification.isRead ? 'medium' : 'small'}
                          >
                            <Done fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {!notification.isRead && (
                        <Box
                          sx={{
                            width: { xs: 6, sm: 8 },
                            height: { xs: 6, sm: 8 },
                            borderRadius: '50%',
                            backgroundColor: 'primary.main',
                            ml: 1,
                          }}
                        />
                      )}
                    </Box>
                  </ListItem>
                </Fade>
              ))}
            </List>
          )}
        </Paper>
      </Fade>
    </Box>
  );
});

export default NotificationManagement;