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
import type { DonationCenterHistory } from '@/types/history';


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

const HistoryManagementDrone: React.FC = observer(() => {
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

  const [history, setHistory] = useState<DonationCenterHistory[]>([]);
  const [loading, setLoading] = useState(true);


  const userType = auth.user?.role?.centerId ? 'donation_center' : 'hospital';
  const userEntityId = auth.user?.role?.centerId || auth.user?.role?.hospitalId;


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
  useEffect(() => {
  const fetchHistory = async () => {
    try {
      const data = await historyApi.getDroneDeliveryHistory();
      setHistory(data);
    } catch (err) {
      console.error('Erreur lors du chargement de l’historique des livraisons drones', err);
    } finally {
      setLoading(false);
    }
  };

  fetchHistory();
}, []);


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
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
            <TextField
              placeholder="Rechercher dans l'historique..."
              value={searchConfig.searchTerm}
              onChange={(e) => setSearchConfig({ searchTerm: e.target.value })}
              sx={{
                flex: 1,
                '& .MuiInputBase-root': {
                  borderRadius: commonStyles.borderRadius,
                  ...commonStyles.techFont
                },
                '& .MuiInputBase-input': commonStyles.techFont
              }}
              slotProps={{
                input: {
                  startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
                }
              }}
            />
            

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel sx={commonStyles.techFont}>Statut</InputLabel>
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

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel sx={commonStyles.techFont}>Urgent</InputLabel>
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

      <Fade in timeout={1200}>
  <Paper
    elevation={0}
    sx={{
      ...commonStyles.glassmorphism,
      overflow: 'hidden'
    }}
  >
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'rgba(0, 142, 255, 0.05)' }}>
            <TableCell sx={commonStyles.techFontBold}>Nom du Drone</TableCell>
            <TableCell sx={commonStyles.techFontBold}>Centre de Don</TableCell>
            <TableCell sx={commonStyles.techFontBold}>Hôpital de Destination</TableCell>
            <TableCell sx={commonStyles.techFontBold}>Type de Sang</TableCell>
            <TableCell sx={commonStyles.techFontBold}>Date Demande</TableCell>
            <TableCell sx={commonStyles.techFontBold}>Date Livraison</TableCell>
            <TableCell sx={commonStyles.techFontBold}>Urgent</TableCell>
            <TableCell sx={commonStyles.techFontBold}>Statut</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {history
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((item) => (
              <TableRow key={item.deliveryId}>
                <TableCell sx={commonStyles.techFont}>
                  {item.droneName}
                </TableCell>
                <TableCell sx={commonStyles.techFont}>
                  {item.sourceDonationCenter?.centerCity || 'Inconnu'}
                </TableCell>
                <TableCell sx={commonStyles.techFont}>
                  {item.destinationHospital.hospitalName}
                </TableCell>
                <TableCell sx={commonStyles.techFont}>
                  {item.bloodType || 'Inconnu'}
                </TableCell>
                <TableCell sx={commonStyles.techFont}>
                  {item.requestDate.toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell sx={commonStyles.techFont}>
                  {item.deliveryDate
                    ? item.deliveryDate.toLocaleDateString('fr-FR')
                    : '-'}
                </TableCell>
                <TableCell>
                  {item.isUrgent && (
                    <Chip
                      label="Urgent"
                      color="error"
                      icon={<PriorityHigh />}
                      size="small"
                      sx={commonStyles.techFont}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    icon={getStatusIcon(item.deliveryStatus)}
                    label={getStatusLabel(item.deliveryStatus)}
                    sx={{
                      backgroundColor: getStatusColor(item.deliveryStatus),
                      color: 'white',
                      ...commonStyles.techFont
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>

    <TablePagination
      rowsPerPageOptions={[5, 10, 25]}
      component="div"
      count={history.length}
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


      {/* Dialog de détails */}
      <Dialog 
        open={showDetailDialog} 
        onClose={handleCloseDetail}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle 
          sx={{ 
            ...commonStyles.techFont,
            background: 'linear-gradient(45deg, #008EFF, #0066cc)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1
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
        <DialogContent sx={{ p: 4 }}>
          {selectedDelivery && (
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Card sx={{ flex: 1, minWidth: 250 }}>
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

                <Card sx={{ flex: 1, minWidth: 250 }}>
                  <CardContent>
                    <Typography variant="h6" sx={commonStyles.sectionTitle}>
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
                  <Typography variant="h6" sx={commonStyles.sectionTitle}>
                    <Business sx={{ color: '#008EFF' }} />
                    Établissements
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    <Box sx={{ flex: 1, minWidth: 250 }}>
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
                    <Box sx={{ flex: 1, minWidth: 250 }}>
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
                  <Typography variant="h6" sx={commonStyles.sectionTitle}>
                    <LocationOn sx={{ color: '#008EFF' }} />
                    Coordonnées GPS
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {selectedDelivery.type === 'delivery' ? (
                      <>
                        <Box sx={{ flex: 1, minWidth: 250 }}>
                          <Typography variant="body2" color="textSecondary" sx={commonStyles.techFont}>
                            Point de départ (Centre)
                          </Typography>
                          <Typography variant="body1" sx={commonStyles.techFontBold}>
                            {selectedDelivery.departureCoordinates.latitude}, {selectedDelivery.departureCoordinates.longitude}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 250 }}>
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
                        <Box sx={{ flex: 1, minWidth: 250 }}>
                          <Typography variant="body2" color="textSecondary" sx={commonStyles.techFont}>
                            Point de départ (Centre)
                          </Typography>
                          <Typography variant="body1" sx={commonStyles.techFontBold}>
                            {selectedDelivery.sourceDonationCenter.latitude}, {selectedDelivery.sourceDonationCenter.longitude}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 250 }}>
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
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleCloseDetail}
            variant="outlined"
            sx={commonStyles.buttonBase}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

export default HistoryManagementDrone;