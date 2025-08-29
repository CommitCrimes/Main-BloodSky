import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Card,
  CardContent,
  Fade,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Search,
  Sort,
  Visibility,
  LocalShipping,
  Schedule,
  Business,
  Close,
  ArrowUpward,
  ArrowDownward,
  CheckCircle,
  Cancel,
  Pending,
  DirectionsCar,
  PriorityHigh,
  LocationOn,
  CalendarToday,
  Numbers
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import type { 
  DeliveryHistory, 
  HistoryFilters, 
  HistorySortConfig, 
  HistorySearchConfig 
} from '../types/history';
import { historyApi } from '../api/history';
import { orderApi } from '../api/order';
import type { UserRole, DonationCenterAdminRole, HospitalAdminRole } from '../types/users';

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
  sectionTitle: {
    fontFamily: 'Share Tech, monospace',
    mb: 2,
    display: 'flex',
    alignItems: 'center',
    gap: 1
  },
  buttonBase: {
    fontFamily: 'Share Tech, monospace',
    borderRadius: '12px',
    px: 3,
    py: 1.5,
    textTransform: 'none' as const
  }
};

const HistoryManagement: React.FC = observer(() => {
  const auth = useAuth();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState<HistoryFilters>({});
  const [sortConfig, setSortConfig] = useState<HistorySortConfig>({
    field: 'requestDate',
    direction: 'desc'
  });
  const [searchConfig, setSearchConfig] = useState<HistorySearchConfig>({
    searchTerm: ''
  });
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryHistory | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [historyData, setHistoryData] = useState<DeliveryHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancellingDelivery, setCancellingDelivery] = useState<number | null>(null);

function isDonationCenterRole(role: UserRole | undefined): role is DonationCenterAdminRole {
  return role?.type === 'donation_center_admin';
}

function isHospitalRole(role: UserRole | undefined): role is HospitalAdminRole {
  return role?.type === 'hospital_admin';
}

  const role = auth.user?.role;
  let userType: 'donation_center' | 'hospital' = 'hospital';
  let userEntityId: number | undefined = undefined;

  if (isDonationCenterRole(role)) {
    userType = 'donation_center';
    userEntityId = role.centerId;
  } else if (isHospitalRole(role)) {
    userType = 'hospital';
    userEntityId = role.hospitalId;
  }


  const reloadHistoryData = useCallback(async () => {
    if (!userEntityId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let data: DeliveryHistory[];
      if (userType === 'donation_center') {
        data = await historyApi.getDonationCenterHistory(userEntityId);
      } else {
        data = await historyApi.getHospitalHistory(userEntityId);
      }
      setHistoryData(data);
    } catch (err) {
      console.error('Erreur lors du chargement de l\'historique:', err);
      setError('Impossible de charger l\'historique');
      setHistoryData([]);
    } finally {
      setIsLoading(false);
    }
  }, [userEntityId, userType]);

  useEffect(() => {
    reloadHistoryData();
  }, [reloadHistoryData]);

  const getStatusColor = (status: DeliveryHistory['deliveryStatus']) => {
    switch (status) {
      case 'delivered':
        return '#10b981';
      case 'in_transit':
        return '#f59e0b';
      case 'pending':
        return '#6b7280';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status: DeliveryHistory['deliveryStatus']) => {
    switch (status) {
      case 'delivered':
        return 'Livré';
      case 'in_transit':
        return 'En transit';
      case 'pending':
        return 'En attente';
      case 'cancelled':
        return 'Annulé';
      default:
        return 'Inconnu';
    }
  };

  const getStatusIcon = (status: DeliveryHistory['deliveryStatus']) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle />;
      case 'in_transit':
        return <DirectionsCar />;
      case 'pending':
        return <Pending />;
      case 'cancelled':
        return <Cancel />;
      default:
        return <Schedule />;
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let result = [...historyData];

    if (filters.status) {
      result = result.filter(item => item.deliveryStatus === filters.status);
    }
    if (filters.isUrgent !== undefined) {
      result = result.filter(item => item.isUrgent === filters.isUrgent);
    }

    if (searchConfig.searchTerm) {
      const searchTerm = searchConfig.searchTerm.toLowerCase();
      result = result.filter(item => {
        const institutionName = item.type === 'delivery' 
          ? item.destinationHospital.hospitalName
          : item.sourceDonationCenter.centerCity;
          
        return item.deliveryId.toString().includes(searchTerm) ||
               institutionName.toLowerCase().includes(searchTerm) ||
               item.personIdentity.toLowerCase().includes(searchTerm) ||
               (item.bloodType && item.bloodType.toLowerCase().includes(searchTerm));
      });
    }

    result.sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (sortConfig.field) {
        case 'requestDate':
          aValue = new Date(a.requestDate).getTime();
          bValue = new Date(b.requestDate).getTime();
          break;
        case 'deliveryId':
          aValue = a.deliveryId;
          bValue = b.deliveryId;
          break;
        case 'destinationName':
          aValue = a.type === 'delivery' ? a.destinationHospital.hospitalName : '';
          bValue = b.type === 'delivery' ? b.destinationHospital.hospitalName : '';
          break;
        case 'sourceName':
          aValue = a.type === 'order' ? a.sourceDonationCenter.centerCity : '';
          bValue = b.type === 'order' ? b.sourceDonationCenter.centerCity : '';
          break;
        case 'bloodType':
          aValue = a.bloodType || '';
          bValue = b.bloodType || '';
          break;
        default:
          aValue = a[sortConfig.field as keyof typeof a] as string;
          bValue = b[sortConfig.field as keyof typeof b] as string;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [historyData, filters, sortConfig, searchConfig]);

  const handleSort = (field: HistorySortConfig['field']) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleViewDetail = (delivery: DeliveryHistory) => {
    setSelectedDelivery(delivery);
    setShowDetailDialog(true);
  };

  const handleCloseDetail = () => {
    setSelectedDelivery(null);
    setShowDetailDialog(false);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCancelOrder = async (deliveryId: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      return;
    }

    setCancellingDelivery(deliveryId);
    try {
      await orderApi.cancelOrder(deliveryId);
      
      await reloadHistoryData();
      
      setError(null);
    } catch (err) {
      console.error('Erreur lors de l\'annulation:', err);
      setError('Impossible d\'annuler la commande');
    } finally {
      setCancellingDelivery(null);
    }
  };

  const getSortIcon = (field: HistorySortConfig['field']) => {
    if (sortConfig.field === field) {
      return sortConfig.direction === 'asc' ? <ArrowUpward /> : <ArrowDownward />;
    }
    return <Sort />;
  };

  if (isLoading) {
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
            Chargement de l'historique...
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
          <Typography 
            variant="h1" 
            sx={{ 
              color: '#981A0E', 
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
              fontFamily: 'Iceland, cursive',
              mb: 1,
              ...commonStyles.gradientText
            }}
          >
            {userType === 'donation_center' ? 'Historique des Livraisons' : 'Historique des Commandes'}
          </Typography>
          <Typography 
            variant="subtitle1"
            sx={{ 
              color: '#5C7F9B', 
              ...commonStyles.techFont,
              opacity: 0.8,
              fontSize: { xs: '0.9rem', md: '1.1rem' }
            }}
          >
            {userType === 'donation_center' 
              ? 'Suivez toutes vos livraisons vers les hôpitaux' 
              : 'Suivez toutes vos commandes de sang'
            }
          </Typography>
        </Paper>
      </Fade>

      {/* Affichage des erreurs */}
      {error && (
        <Fade in timeout={600}>
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: '16px',
              '& .MuiAlert-message': commonStyles.techFont
            }} 
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        </Fade>
      )}

      {/* Filtres et recherche */}
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
              placeholder="Rechercher dans l'historique..."
              value={searchConfig.searchTerm}
              onChange={(e) => setSearchConfig({ searchTerm: e.target.value })}
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
            

            <FormControl sx={{ minWidth: { xs: '100%', md: 150 } }}>
              <InputLabel sx={{ ...commonStyles.techFont, fontSize: { xs: '0.9rem', sm: '1rem' } }}>Statut</InputLabel>
              <Select
                value={filters.status || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as DeliveryHistory['deliveryStatus'] || undefined }))}
                label="Statut"
                sx={{
                  borderRadius: commonStyles.borderRadius,
                  ...commonStyles.techFont
                }}
              >
                <MenuItem value="">Tous</MenuItem>
                <MenuItem value="pending">En attente</MenuItem>
                <MenuItem value="in_transit">En transit</MenuItem>
                <MenuItem value="delivered">Livré</MenuItem>
                <MenuItem value="cancelled">Annulé</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: { xs: '100%', md: 150 } }}>
              <InputLabel sx={{ ...commonStyles.techFont, fontSize: { xs: '0.9rem', sm: '1rem' } }}>Urgent</InputLabel>
              <Select
                value={filters.isUrgent === undefined ? 'all' : (filters.isUrgent ? 'true' : 'false')}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  isUrgent: e.target.value === 'all' ? undefined : e.target.value === 'true'
                }))}
                label="Urgent"
                sx={{
                  borderRadius: commonStyles.borderRadius,
                  ...commonStyles.techFont
                }}
              >
                <MenuItem value="all">Tous</MenuItem>
                <MenuItem value="true">Urgent</MenuItem>
                <MenuItem value="false">Normal</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Paper>
      </Fade>

      {/* Tableau des données - Desktop */}
      <Fade in timeout={1200}>
        <Paper
          elevation={0}
          sx={{
            ...commonStyles.glassmorphism,
            overflow: 'hidden',
            display: { xs: 'none', md: 'block' }
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'rgba(0, 142, 255, 0.05)' }}>
                  <TableCell sx={commonStyles.techFontBold}>
                    <Button
                      onClick={() => handleSort('deliveryId')}
                      startIcon={getSortIcon('deliveryId')}
                      sx={{ ...commonStyles.techFont, textTransform: 'none' }}
                    >
                      N° {userType === 'donation_center' ? 'Livraison' : 'Commande'}
                    </Button>
                  </TableCell>
                  <TableCell sx={commonStyles.techFontBold}>
                    <Button
                      onClick={() => handleSort('requestDate')}
                      startIcon={getSortIcon('requestDate')}
                      sx={{ ...commonStyles.techFont, textTransform: 'none' }}
                    >
                      Date Demande
                    </Button>
                  </TableCell>
                  <TableCell sx={commonStyles.techFontBold}>
                    Date Livraison
                  </TableCell>
                  <TableCell sx={commonStyles.techFontBold}>
                    <Button
                      onClick={() => handleSort(userType === 'donation_center' ? 'destinationName' : 'sourceName')}
                      startIcon={getSortIcon(userType === 'donation_center' ? 'destinationName' : 'sourceName')}
                      sx={{ ...commonStyles.techFont, textTransform: 'none' }}
                    >
                      {userType === 'donation_center' ? 'Hôpital de destination' : 'Centre de donation'}
                    </Button>
                  </TableCell>
                  <TableCell sx={commonStyles.techFontBold}>
                    <Button
                      onClick={() => handleSort('bloodType')}
                      startIcon={getSortIcon('bloodType')}
                      sx={{ ...commonStyles.techFont, textTransform: 'none' }}
                    >
                      Type de sang
                    </Button>
                  </TableCell>
                  <TableCell sx={commonStyles.techFontBold}>
                    <Button
                      onClick={() => handleSort('personIdentity')}
                      startIcon={getSortIcon('personIdentity')}
                      sx={{ ...commonStyles.techFont, textTransform: 'none' }}
                    >
                      Personne
                    </Button>
                  </TableCell>
                  <TableCell sx={commonStyles.techFontBold}>
                    Statut
                  </TableCell>
                  <TableCell sx={commonStyles.techFontBold}>
                    Urgent
                  </TableCell>
                  <TableCell sx={commonStyles.techFontBold}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((delivery) => (
                    <TableRow key={delivery.id} sx={{ ...commonStyles.techFont, '&:hover': { backgroundColor: 'rgba(0, 142, 255, 0.02)' } }}>
                      <TableCell sx={commonStyles.techFont}>
                        {delivery.deliveryId}
                      </TableCell>
                      <TableCell>
                        {delivery.requestDate.toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        {delivery.deliveryDate ? delivery.deliveryDate.toLocaleDateString('fr-FR') : '-'}
                      </TableCell>
                      <TableCell>
                        {delivery.type === 'delivery' 
                          ? delivery.destinationHospital.hospitalName
                          : `${delivery.sourceDonationCenter.centerCity} - Centre de Don`
                        }
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={delivery.bloodType || 'N/A'}
                          size="small"
                          sx={{ ...commonStyles.techFont, backgroundColor: '#f0f4f8' }}
                        />
                      </TableCell>
                      <TableCell>
                        {delivery.personIdentity}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(delivery.deliveryStatus)}
                          label={getStatusLabel(delivery.deliveryStatus)}
                          sx={{
                            backgroundColor: getStatusColor(delivery.deliveryStatus),
                            color: 'white',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {delivery.isUrgent && (
                          <Chip
                            icon={<PriorityHigh />}
                            label="Urgent"
                            color="error"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Voir les détails">
                            <IconButton onClick={() => handleViewDetail(delivery)}>
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          {delivery.deliveryStatus === 'pending' && (
                            <Tooltip title="Annuler la commande">
                              <IconButton 
                                onClick={() => handleCancelOrder(delivery.deliveryId)}
                                disabled={cancellingDelivery === delivery.deliveryId}
                                color="error"
                              >
                                {cancellingDelivery === delivery.deliveryId ? (
                                  <CircularProgress size={20} />
                                ) : (
                                  <Cancel />
                                )}
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredAndSortedData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': commonStyles.techFont
            }}
          />
        </Paper>
      </Fade>

      {/* Version mobile avec cardes */}
      <Fade in timeout={1200}>
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <Stack spacing={2}>
            {filteredAndSortedData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((delivery) => (
                <Card 
                  key={delivery.id}
                  sx={{
                    ...commonStyles.glassmorphism,
                    p: 2,
                    '&:hover': { 
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                      transition: 'all 0.2s ease'
                    }
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          ...commonStyles.techFontBold,
                          fontSize: '1.1rem',
                          color: '#008EFF'
                        }}
                      >
                        #{delivery.deliveryId}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip
                          icon={getStatusIcon(delivery.deliveryStatus)}
                          label={getStatusLabel(delivery.deliveryStatus)}
                          size="small"
                          sx={{
                            backgroundColor: getStatusColor(delivery.deliveryStatus),
                            color: 'white',
                            fontSize: '0.75rem'
                          }}
                        />
                        {delivery.isUrgent && (
                          <Chip
                            icon={<PriorityHigh />}
                            label="Urgent"
                            color="error"
                            size="small"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    </Box>
                    
                    <Stack spacing={1.5}>
                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={commonStyles.techFont}>
                          {userType === 'donation_center' ? 'Hôpital de destination' : 'Centre de donation'}
                        </Typography>
                        <Typography variant="body2" sx={{ ...commonStyles.techFontBold, fontSize: '0.9rem' }}>
                          {delivery.type === 'delivery' 
                            ? delivery.destinationHospital.hospitalName
                            : `${delivery.sourceDonationCenter.centerCity} - Centre de Don`
                          }
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 3 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="textSecondary" sx={commonStyles.techFont}>
                            Date demande
                          </Typography>
                          <Typography variant="body2" sx={{ ...commonStyles.techFont, fontSize: '0.85rem' }}>
                            {delivery.requestDate.toLocaleDateString('fr-FR')}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="textSecondary" sx={commonStyles.techFont}>
                            Date livraison
                          </Typography>
                          <Typography variant="body2" sx={{ ...commonStyles.techFont, fontSize: '0.85rem' }}>
                            {delivery.deliveryDate ? delivery.deliveryDate.toLocaleDateString('fr-FR') : '-'}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 3 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="textSecondary" sx={commonStyles.techFont}>
                            Type de sang
                          </Typography>
                          <Chip
                            label={delivery.bloodType || 'N/A'}
                            size="small"
                            sx={{ 
                              ...commonStyles.techFont, 
                              backgroundColor: '#f0f4f8',
                              fontSize: '0.75rem',
                              height: '24px'
                            }}
                          />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="textSecondary" sx={commonStyles.techFont}>
                            Personne
                          </Typography>
                          <Typography variant="body2" sx={{ ...commonStyles.techFont, fontSize: '0.85rem' }}>
                            {delivery.personIdentity}
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, pt: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                      <Button
                        onClick={() => handleViewDetail(delivery)}
                        startIcon={<Visibility />}
                        size="small"
                        sx={{
                          ...commonStyles.buttonBase,
                          fontSize: '0.8rem',
                          py: 0.5,
                          px: 2
                        }}
                      >
                        Détails
                      </Button>
                      {delivery.deliveryStatus === 'pending' && (
                        <Button
                          onClick={() => handleCancelOrder(delivery.deliveryId)}
                          disabled={cancellingDelivery === delivery.deliveryId}
                          color="error"
                          size="small"
                          startIcon={cancellingDelivery === delivery.deliveryId ? (
                            <CircularProgress size={16} />
                          ) : (
                            <Cancel />
                          )}
                          sx={{
                            ...commonStyles.buttonBase,
                            fontSize: '0.8rem',
                            py: 0.5,
                            px: 2
                          }}
                        >
                          Annuler
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
          </Stack>
          
          {/* Pagination mobile */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredAndSortedData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  ...commonStyles.techFont,
                  fontSize: '0.8rem'
                },
                '& .MuiTablePagination-select': {
                  fontSize: '0.8rem'
                }
              }}
            />
          </Box>
        </Box>
      </Fade>

      {/* Dialog de détails */}
      <Dialog 
        open={showDetailDialog} 
        onClose={handleCloseDetail}
        maxWidth="md"
        fullWidth
        fullScreen
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: '16px' },
            margin: { xs: 0, sm: '32px' },
            maxHeight: { xs: '100vh', sm: '90vh' }
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            ...commonStyles.techFont,
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
            background: 'linear-gradient(45deg, #008EFF, #0066cc)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: { xs: 2, sm: 3 },
            py: { xs: 1.5, sm: 2 }
          }}
        >
          <LocalShipping />
          Détails {selectedDelivery?.type === 'delivery' ? 'de la livraison' : 'de la commande'} #{selectedDelivery?.deliveryId}
          <IconButton
            onClick={handleCloseDetail}
            sx={{ 
              position: 'absolute', 
              right: 8, 
              top: 8,
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 4 } }}>
          {selectedDelivery && (
            <Stack spacing={{ xs: 2, sm: 3 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, sm: 3 } }}>
                <Card sx={{ flex: 1, minWidth: { xs: '100%', sm: 250 } }}>
                  <CardContent>
                    <Typography variant="h6" sx={commonStyles.sectionTitle}>
                      <Numbers sx={{ color: '#008EFF' }} />
                      Informations générales
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="textSecondary" sx={commonStyles.techFont}>
                          Numéro {selectedDelivery.type === 'delivery' ? 'de livraison' : 'de commande'}
                        </Typography>
                        <Typography variant="body1" sx={commonStyles.techFontBold}>
                          {selectedDelivery.deliveryId}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="textSecondary" sx={commonStyles.techFont}>
                          Type de sang
                        </Typography>
                        <Chip
                          label={selectedDelivery.bloodType || 'N/A'}
                          size="small"
                          sx={{ ...commonStyles.techFont, backgroundColor: '#f0f4f8' }}
                        />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="textSecondary" sx={commonStyles.techFont}>
                          Personne responsable
                        </Typography>
                        <Typography variant="body1" sx={commonStyles.techFontBold}>
                          {selectedDelivery.personIdentity}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                <Card sx={{ flex: 1, minWidth: { xs: '100%', sm: 250 } }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ ...commonStyles.sectionTitle, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                      <CalendarToday sx={{ color: '#008EFF' }} />
                      Dates et statut
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="textSecondary" sx={commonStyles.techFont}>
                          Date de demande
                        </Typography>
                        <Typography variant="body1" sx={commonStyles.techFontBold}>
                          {selectedDelivery.requestDate.toLocaleDateString('fr-FR')}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="textSecondary" sx={commonStyles.techFont}>
                          Date de livraison
                        </Typography>
                        <Typography variant="body1" sx={commonStyles.techFontBold}>
                          {selectedDelivery.deliveryDate ? selectedDelivery.deliveryDate.toLocaleDateString('fr-FR') : 'Non livrée'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="textSecondary" sx={commonStyles.techFont}>
                          Statut
                        </Typography>
                        <Chip
                          icon={getStatusIcon(selectedDelivery.deliveryStatus)}
                          label={getStatusLabel(selectedDelivery.deliveryStatus)}
                          sx={{
                            backgroundColor: getStatusColor(selectedDelivery.deliveryStatus),
                            color: 'white',
                            fontFamily: 'Share Tech, monospace'
                          }}
                        />
                      </Box>
                      {selectedDelivery.isUrgent && (
                        <Box>
                          <Chip
                            icon={<PriorityHigh />}
                            label="Livraison Urgente"
                            color="error"
                            sx={commonStyles.techFont}
                          />
                        </Box>
                      )}
                      {selectedDelivery.droneName && (
                        <Box>
                          <Typography variant="body2" color="textSecondary" sx={commonStyles.techFont}>
                            Drone assigné
                          </Typography>
                          <Typography variant="body1" sx={commonStyles.techFontBold}>
                            {selectedDelivery.droneName} (ID: {selectedDelivery.droneId})
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Box>

              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ ...commonStyles.sectionTitle, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    <Business sx={{ color: '#008EFF' }} />
                    Établissements
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, sm: 3 } }}>
                    <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 250 } }}>
                      <Typography variant="body2" color="textSecondary" sx={commonStyles.techFont}>
                        {selectedDelivery.type === 'delivery' ? 'Hôpital de destination' : 'Centre de donation'}
                      </Typography>
                      <Typography variant="body1" sx={commonStyles.techFontBold}>
                        {selectedDelivery.type === 'delivery' 
                          ? selectedDelivery.destinationHospital.hospitalName
                          : `${selectedDelivery.sourceDonationCenter.centerCity} - Centre de Don`
                        }
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 250 } }}>
                      <Typography variant="body2" color="textSecondary" sx={commonStyles.techFont}>
                        Adresse
                      </Typography>
                      <Typography variant="body1" sx={commonStyles.techFontBold}>
                        {selectedDelivery.type === 'delivery' 
                          ? selectedDelivery.destinationHospital.hospitalAddress
                          : selectedDelivery.sourceDonationCenter.centerAddress
                        }
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ ...commonStyles.sectionTitle, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    <LocationOn sx={{ color: '#008EFF' }} />
                    Coordonnées GPS
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, sm: 3 } }}>
                    {selectedDelivery.type === 'delivery' ? (
                      <>
                        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 250 } }}>
                          <Typography variant="body2" color="textSecondary" sx={commonStyles.techFont}>
                            Point de départ (Centre)
                          </Typography>
                          <Typography variant="body1" sx={commonStyles.techFontBold}>
                            {selectedDelivery.departureCoordinates.latitude}, {selectedDelivery.departureCoordinates.longitude}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 250 } }}>
                          <Typography variant="body2" color="textSecondary" sx={commonStyles.techFont}>
                            Point d'arrivée (Hôpital)
                          </Typography>
                          <Typography variant="body1" sx={commonStyles.techFontBold}>
                            {selectedDelivery.destinationHospital.latitude}, {selectedDelivery.destinationHospital.longitude}
                          </Typography>
                        </Box>
                      </>
                    ) : (
                      <>
                        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 250 } }}>
                          <Typography variant="body2" color="textSecondary" sx={commonStyles.techFont}>
                            Point de départ (Centre)
                          </Typography>
                          <Typography variant="body1" sx={commonStyles.techFontBold}>
                            {selectedDelivery.sourceDonationCenter.latitude}, {selectedDelivery.sourceDonationCenter.longitude}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 250 } }}>
                          <Typography variant="body2" color="textSecondary" sx={commonStyles.techFont}>
                            Point d'arrivée (Hôpital)
                          </Typography>
                          <Typography variant="body1" sx={commonStyles.techFontBold}>
                            {selectedDelivery.arrivalCoordinates.latitude}, {selectedDelivery.arrivalCoordinates.longitude}
                          </Typography>
                        </Box>
                      </>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 }, gap: 1 }}>
          <Button 
            onClick={handleCloseDetail}
            variant="outlined"
            fullWidth
            sx={{
              ...commonStyles.buttonBase,
              fontSize: { xs: '0.9rem', sm: '1rem' }
            }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

export default HistoryManagement;