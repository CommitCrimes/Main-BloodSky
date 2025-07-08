import React, { useState, useEffect, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Badge,
  Fade,
  Stack,
  Switch,
  FormControlLabel,
  Snackbar
} from '@mui/material';
import {
  PriorityHigh,
  CheckCircle,
  ShoppingCart,
  Close,
  Add,
  Remove
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { orderApi } from '../api/order';
import type { 
  BloodStock, 
  DonationCenter, 
  OrderRequest, 
  OrderFilters
} from '../types/order';
import { BLOOD_TYPES } from '../types/order';

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

const getBloodTypeColor = (bloodType: string) => {
  const colors: Record<string, string> = {
    'A+': '#e74c3c',
    'A-': '#c0392b',
    'B+': '#3498db',
    'B-': '#2980b9',
    'AB+': '#9b59b6',
    'AB-': '#8e44ad',
    'O+': '#e67e22',
    'O-': '#d35400'
  };
  return colors[bloodType] || '#95a5a6';
};

const OrderBlood: React.FC = observer(() => {
  const auth = useAuth();
  const [bloodStock, setBloodStock] = useState<BloodStock[]>([]);
  const [donationCenters, setDonationCenters] = useState<DonationCenter[]>([]);
  const [filters, setFilters] = useState<OrderFilters>({});
  const [selectedItems, setSelectedItems] = useState<Map<string, number>>(new Map());
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');


  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const [centers, stock] = await Promise.all([
          orderApi.getDonationCenters(),
          orderApi.getAvailableBloodStock()
        ]);
        
        setDonationCenters(centers);
        setBloodStock(stock);
        
        if (centers.length > 0) {
          setFilters(prev => ({ ...prev, centerId: centers[0].centerId }));
        }
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Impossible de charger les données');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredStock = useMemo(() => {
    let result = [...bloodStock];

    if (filters.bloodType) {
      result = result.filter(stock => stock.bloodType === filters.bloodType);
    }

    return result.filter(stock => stock.availableQuantity > 0);
  }, [bloodStock, filters]);

  const handleQuantityChange = (bloodType: string, change: number) => {
    const currentQuantity = selectedItems.get(bloodType) || 0;
    const stock = bloodStock.find(s => s.bloodType === bloodType);
    const maxQuantity = stock?.availableQuantity || 0;
    
    const newQuantity = Math.max(0, Math.min(maxQuantity, currentQuantity + change));
    
    const newSelectedItems = new Map(selectedItems);
    if (newQuantity === 0) {
      newSelectedItems.delete(bloodType);
    } else {
      newSelectedItems.set(bloodType, newQuantity);
    }
    setSelectedItems(newSelectedItems);
  };

  const getTotalItems = () => {
    return Array.from(selectedItems.values()).reduce((sum, qty) => sum + qty, 0);
  };

  const handleOrder = async () => {
    if (selectedItems.size === 0) {
      setError('Veuillez sélectionner au moins un type de sang');
      return;
    }

    if (!auth.user?.role?.hospitalId) {
      setError('Impossible de déterminer votre hôpital');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const orders: OrderRequest[] = Array.from(selectedItems.entries()).map(([bloodType, quantity]) => ({
        hospitalId: auth.user!.role!.hospitalId!,
        centerId: filters.centerId || donationCenters[0].centerId,
        bloodType,
        quantity,
        isUrgent,
        notes: orderNotes
      }));

      const results = await Promise.all(orders.map(order => orderApi.createOrder(order)));
      
      console.log('Commandes créées:', results);
      
      const newStock = bloodStock.map(stock => {
        const orderQuantity = selectedItems.get(stock.bloodType) || 0;
        return {
          ...stock,
          availableQuantity: stock.availableQuantity - orderQuantity
        };
      });
      setBloodStock(newStock);

      setSuccessMessage(`Commande passée avec succès ! ${getTotalItems()} poche(s) commandée(s).`);
      setSelectedItems(new Map());
      setShowOrderDialog(false);
      setOrderNotes('');
      setIsUrgent(false);

    } catch (err) {
      console.error('Erreur lors de la commande:', err);
      setError('Impossible de passer la commande');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && bloodStock.length === 0) {
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
            Chargement du stock disponible...
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
            Commander du Sang
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
            Sélectionnez les types de sang dont vous avez besoin
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

      {/* Filtres */}
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
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel sx={commonStyles.techFont}>Centre de donation</InputLabel>
              <Select
                value={filters.centerId || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, centerId: e.target.value as number }))}
                label="Centre de donation"
                sx={{
                  borderRadius: commonStyles.borderRadius,
                  ...commonStyles.techFont
                }}
              >
                {donationCenters.map(center => (
                  <MenuItem key={center.centerId} value={center.centerId}>
                    {center.centerCity} - {center.centerAdress}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel sx={commonStyles.techFont}>Type de sang</InputLabel>
              <Select
                value={filters.bloodType || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, bloodType: e.target.value || undefined }))}
                label="Type de sang"
                sx={{
                  borderRadius: commonStyles.borderRadius,
                  ...commonStyles.techFont
                }}
              >
                <MenuItem value="">Tous</MenuItem>
                {BLOOD_TYPES.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {getTotalItems() > 0 && (
              <Badge badgeContent={getTotalItems()} color="error">
                <Button
                  variant="contained"
                  startIcon={<ShoppingCart />}
                  onClick={() => setShowOrderDialog(true)}
                  sx={{
                    ...commonStyles.buttonBase,
                    bgcolor: '#10b981',
                    '&:hover': { 
                      bgcolor: '#059669',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
                    }
                  }}
                >
                  Commander
                </Button>
              </Badge>
            )}
          </Stack>
        </Paper>
      </Fade>

      {/* Stock disponible */}
      <Fade in timeout={1200}>
        <Grid container spacing={3}>
          {filteredStock.map((stock) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={stock.bloodType}>
              <Card 
                elevation={0}
                sx={{
                  ...commonStyles.glassmorphism,
                  overflow: 'hidden',
                  height: '100%',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2} alignItems="center">
                    <Chip
                      label={stock.bloodType}
                      sx={{
                        backgroundColor: getBloodTypeColor(stock.bloodType),
                        color: 'white',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        ...commonStyles.techFont,
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        '& .MuiChip-label': {
                          fontSize: '1.5rem'
                        }
                      }}
                    />

                    <Typography variant="h6" sx={commonStyles.techFontBold}>
                      {stock.availableQuantity} poche{stock.availableQuantity > 1 ? 's' : ''}
                    </Typography>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Button
                        size="small"
                        onClick={() => handleQuantityChange(stock.bloodType, -1)}
                        disabled={!selectedItems.has(stock.bloodType)}
                        sx={{ minWidth: '40px', height: '40px' }}
                      >
                        <Remove />
                      </Button>
                      
                      <Chip
                        label={selectedItems.get(stock.bloodType) || 0}
                        sx={{
                          ...commonStyles.techFont,
                          minWidth: '50px',
                          backgroundColor: selectedItems.has(stock.bloodType) ? '#e3f8fe' : '#f5f5f5'
                        }}
                      />
                      
                      <Button
                        size="small"
                        onClick={() => handleQuantityChange(stock.bloodType, 1)}
                        disabled={stock.availableQuantity === 0 || 
                                (selectedItems.get(stock.bloodType) || 0) >= stock.availableQuantity}
                        sx={{ minWidth: '40px', height: '40px' }}
                      >
                        <Add />
                      </Button>
                    </Stack>

                    {stock.availableQuantity === 0 && (
                      <Chip
                        label="Stock épuisé"
                        color="error"
                        size="small"
                        sx={commonStyles.techFont}
                      />
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Fade>

      {/* Dialog de commande */}
      <Dialog 
        open={showOrderDialog} 
        onClose={() => setShowOrderDialog(false)}
        maxWidth="sm"
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
          <ShoppingCart />
          Confirmer la commande
          <Button
            onClick={() => setShowOrderDialog(false)}
            sx={{ 
              position: 'absolute', 
              right: 8, 
              top: 8,
              color: 'white',
              minWidth: 'auto',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <Close />
          </Button>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Typography variant="h6" sx={commonStyles.techFont}>
              Récapitulatif de votre commande :
            </Typography>
            
            {Array.from(selectedItems.entries()).map(([bloodType, quantity]) => (
              <Box key={bloodType} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip
                  label={bloodType}
                  sx={{
                    backgroundColor: getBloodTypeColor(bloodType),
                    color: 'white',
                    ...commonStyles.techFont
                  }}
                />
                <Typography sx={commonStyles.techFont}>
                  {quantity} poche{quantity > 1 ? 's' : ''}
                </Typography>
              </Box>
            ))}

            <FormControlLabel
              control={
                <Switch
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  color="error"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PriorityHigh color="error" />
                  <Typography sx={commonStyles.techFont}>Commande urgente</Typography>
                </Box>
              }
            />

            <TextField
              fullWidth
              label="Notes (optionnel)"
              multiline
              rows={3}
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="Informations complémentaires sur la commande..."
              sx={{
                '& .MuiInputBase-input': commonStyles.techFont,
                '& .MuiInputLabel-root': commonStyles.techFont
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={() => setShowOrderDialog(false)}
            disabled={isLoading}
            variant="outlined"
            sx={commonStyles.buttonBase}
          >
            Annuler
          </Button>
          <Button
            onClick={handleOrder}
            disabled={isLoading}
            variant="contained"
            startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <CheckCircle />}
            sx={{
              ...commonStyles.buttonBase,
              bgcolor: '#10b981',
              '&:hover': { 
                bgcolor: '#059669',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
              }
            }}
          >
            {isLoading ? 'Commande en cours...' : 'Confirmer la commande'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar de succès */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSuccessMessage('')} 
          severity="success"
          variant="filled"
          sx={{ 
            width: '100%',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
            '& .MuiAlert-message': commonStyles.techFont
          }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
});

export default OrderBlood;