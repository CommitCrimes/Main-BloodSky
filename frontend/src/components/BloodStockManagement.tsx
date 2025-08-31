import React, { useState, useEffect } from 'react';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Snackbar,
  IconButton,
  Chip,
  Card,
  CardContent,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Refresh as RefreshIcon,
  Bloodtype as BloodtypeIcon,
  LocalHospital as LocalHospitalIcon,
} from '@mui/icons-material';
import { bloodStockApi, type BloodStock } from '@/api/bloodStock';
import { useAuth } from '@/hooks/useAuth';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const BloodStockManagement: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [stocks, setStocks] = useState<BloodStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
  const [selectedBloodType, setSelectedBloodType] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [removeReason, setRemoveReason] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'info' });

  const centerId = (user?.role && 'centerId' in user.role ? user.role.centerId : undefined) || 1;

  useEffect(() => {
    loadStock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStock = async () => {
    try {
      setLoading(true);
      const data = await bloodStockApi.getStockByCenter(centerId);
      setStocks(data);
    } catch (error) {
      console.error('Erreur lors du chargement du stock:', error);
      showSnackbar('Erreur lors du chargement du stock', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = async () => {
    if (!selectedBloodType || quantity <= 0) {
      showSnackbar('Veuillez remplir tous les champs correctement', 'warning');
      return;
    }

    try {
      const response = await bloodStockApi.addStock(selectedBloodType, quantity, centerId);
      if (response.success) {
        showSnackbar(response.message, 'success');
        setOpenAddDialog(false);
        resetForm();
        loadStock();
      } else {
        showSnackbar(response.message || 'Erreur lors de l\'ajout', 'error');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de stock:', error);
      showSnackbar('Erreur lors de l\'ajout de stock', 'error');
    }
  };

  const handleRemoveStock = async () => {
    if (!selectedBloodType || quantity <= 0) {
      showSnackbar('Veuillez remplir tous les champs correctement', 'warning');
      return;
    }

    try {
      const response = await bloodStockApi.removeStock(
        selectedBloodType,
        quantity,
        centerId,
        removeReason
      );
      if (response.success) {
        showSnackbar(response.message, 'success');
        setOpenRemoveDialog(false);
        resetForm();
        loadStock();
      } else {
        showSnackbar(response.message || 'Erreur lors du retrait', 'error');
      }
    } catch (error) {
      console.error('Erreur lors du retrait de stock:', error);
      showSnackbar('Erreur lors du retrait de stock', 'error');
    }
  };

  const resetForm = () => {
    setSelectedBloodType('');
    setQuantity(1);
    setRemoveReason('');
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const getBloodTypeColor = (bloodType: string) => {
    const colors: Record<string, string> = {
      'A+': '#ef4444',
      'A-': '#dc2626',
      'B+': '#3b82f6',
      'B-': '#2563eb',
      'AB+': '#a855f7',
      'AB-': '#9333ea',
      'O+': '#22c55e',
      'O-': '#16a34a',
    };
    return colors[bloodType] || '#6b7280';
  };

  const getTotalStock = () => {
    return stocks.reduce((total, stock) => total + stock.quantity, 0);
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, backgroundColor: '#e3f8fe', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 2, sm: 3, md: 4 }, textAlign: 'center' }}>
        <Typography
          variant="h3"
          sx={{
            color: '#981A0E',
            fontFamily: 'Iceland, cursive',
            mb: 1,
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem', lg: '3rem' },
          }}
        >
          Gestion du Stock de Sang
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: 'text.primary',
            fontFamily: 'Share Tech, monospace',
            fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' },
          }}
        >
          Centre de Donation #{centerId}
        </Typography>
      </Box>

      {/* Statistiques rapides */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        gap: { xs: 2, sm: 2, md: 3 }, 
        mb: { xs: 3, md: 4 } 
      }}>
        <Box sx={{ flex: 1 }}>
          <Card sx={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            height: '100%' 
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Stock Total
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#008EFF', fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
                    {getTotalStock()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    poches de sang
                  </Typography>
                </Box>
                <LocalHospitalIcon sx={{ fontSize: { xs: 30, sm: 35, md: 40 }, color: '#008EFF' }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Card sx={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            height: '100%' 
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Types Disponibles
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#10b981', fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
                    {stocks.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    groupes sanguins
                  </Typography>
                </Box>
                <BloodtypeIcon sx={{ fontSize: { xs: 30, sm: 35, md: 40 }, color: '#10b981' }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: 1, display: { xs: 'none', sm: 'block' } }}>
          <Card sx={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            height: '100%' 
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Dernière Mise à Jour
                  </Typography>
                  <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    {new Date().toLocaleTimeString('fr-FR')}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    {new Date().toLocaleDateString('fr-FR')}
                  </Typography>
                </Box>
                <RefreshIcon sx={{ fontSize: { xs: 30, sm: 35, md: 40 }, color: '#f59e0b' }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Table des stocks */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2, md: 3 },
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: { xs: '10px', sm: '15px', md: '20px' },
          overflowX: 'auto',
        }}
      >
        <Typography
          variant="h5"
          sx={{
            mb: { xs: 2, sm: 3 },
            fontFamily: 'Share Tech, monospace',
            color: '#5C7F9B',
            fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
          }}
        >
          Stock par Groupe Sanguin
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: { xs: 3, sm: 5 } }}>
            <CircularProgress />
          </Box>
        ) : stocks.length === 0 ? (
          <Alert severity="info" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            Aucun stock disponible. Ajoutez des poches de sang pour commencer.
          </Alert>
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: { xs: 300, sm: 500 } }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ p: { xs: 1, sm: 2 } }}>
                    <Typography fontWeight="bold" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}>
                      Groupe
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ p: { xs: 1, sm: 2 } }}>
                    <Typography fontWeight="bold" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}>
                      {isMobile ? 'Qté' : 'Quantité'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ p: { xs: 1, sm: 2 }, display: { xs: 'none', sm: 'table-cell' } }}>
                    <Typography fontWeight="bold" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}>
                      Statut
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ p: { xs: 1, sm: 2 } }}>
                    <Typography fontWeight="bold" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}>
                      Actions
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {BLOOD_TYPES.map((bloodType) => {
                  const stock = stocks.find((s) => s.bloodType === bloodType);
                  const quantity = stock?.quantity || 0;
                  return (
                    <TableRow key={bloodType}>
                      <TableCell sx={{ p: { xs: 1, sm: 2 } }}>
                        <Chip
                          label={bloodType}
                          sx={{
                            backgroundColor: getBloodTypeColor(bloodType),
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
                            height: { xs: 24, sm: 28, md: 32 },
                          }}
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ p: { xs: 1, sm: 2 } }}>
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{
                              color: quantity > 0 ? '#16a34a' : '#ef4444',
                              fontWeight: 'bold',
                              fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
                            }}
                          >
                            {quantity}
                          </Typography>
                          {isMobile && (
                            <Chip
                              label={
                                quantity === 0
                                  ? 'Rupture'
                                  : quantity < 5
                                  ? 'Faible'
                                  : 'OK'
                              }
                              color={
                                quantity === 0
                                  ? 'error'
                                  : quantity < 5
                                  ? 'warning'
                                  : 'success'
                              }
                              size="small"
                              sx={{ 
                                fontSize: '0.6rem',
                                height: 16,
                                mt: 0.5
                              }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center" sx={{ p: { xs: 1, sm: 2 }, display: { xs: 'none', sm: 'table-cell' } }}>
                        <Chip
                          label={
                            quantity === 0
                              ? 'Rupture'
                              : quantity < 5
                              ? 'Stock Faible'
                              : 'Disponible'
                          }
                          color={
                            quantity === 0
                              ? 'error'
                              : quantity < 5
                              ? 'warning'
                              : 'success'
                          }
                          size="small"
                          sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.75rem' } }}
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ p: { xs: 1, sm: 2 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 0.5, sm: 1 } }}>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => {
                              setSelectedBloodType(bloodType);
                              setOpenAddDialog(true);
                            }}
                            sx={{ 
                              p: { xs: 0.5, sm: 1 },
                              '& .MuiSvgIcon-root': { 
                                fontSize: { xs: '1rem', sm: '1.25rem' } 
                              }
                            }}
                          >
                            <AddIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            disabled={quantity === 0}
                            onClick={() => {
                              setSelectedBloodType(bloodType);
                              setOpenRemoveDialog(true);
                            }}
                            sx={{ 
                              p: { xs: 0.5, sm: 1 },
                              '& .MuiSvgIcon-root': { 
                                fontSize: { xs: '1rem', sm: '1.25rem' } 
                              }
                            }}
                          >
                            <RemoveIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Dialog Ajouter */}
      <Dialog 
        open={openAddDialog} 
        onClose={() => setOpenAddDialog(false)}
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
          Ajouter des Poches de Sang
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              select
              label="Groupe Sanguin"
              value={selectedBloodType}
              onChange={(e) => setSelectedBloodType(e.target.value)}
              fullWidth
              size={isMobile ? 'small' : 'medium'}
            >
              {BLOOD_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="number"
              label="Quantité"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              inputProps={{ min: 1 }}
              fullWidth
              size={isMobile ? 'small' : 'medium'}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
          <Button onClick={() => setOpenAddDialog(false)} size={isMobile ? 'small' : 'medium'}>
            Annuler
          </Button>
          <Button
            onClick={handleAddStock}
            variant="contained"
            sx={{
              backgroundColor: '#10b981',
              '&:hover': { backgroundColor: '#059669' },
            }}
            size={isMobile ? 'small' : 'medium'}
          >
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Retirer */}
      <Dialog 
        open={openRemoveDialog} 
        onClose={() => setOpenRemoveDialog(false)}
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
          Retirer des Poches de Sang
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              select
              label="Groupe Sanguin"
              value={selectedBloodType}
              onChange={(e) => setSelectedBloodType(e.target.value)}
              fullWidth
              size={isMobile ? 'small' : 'medium'}
            >
              {BLOOD_TYPES.map((type) => {
                const stock = stocks.find((s) => s.bloodType === type);
                const available = stock?.quantity || 0;
                return (
                  <MenuItem key={type} value={type} disabled={available === 0}>
                    {type} ({available} disponible)
                  </MenuItem>
                );
              })}
            </TextField>
            <TextField
              type="number"
              label="Quantité"
              value={quantity}
              onChange={(e) => {
                const stock = stocks.find((s) => s.bloodType === selectedBloodType);
                const max = stock?.quantity || 1;
                setQuantity(Math.min(max, Math.max(1, parseInt(e.target.value) || 1)));
              }}
              inputProps={{
                min: 1,
                max: stocks.find((s) => s.bloodType === selectedBloodType)?.quantity || 1,
              }}
              fullWidth
              size={isMobile ? 'small' : 'medium'}
            />
            <TextField
              label="Raison du retrait (optionnel)"
              value={removeReason}
              onChange={(e) => setRemoveReason(e.target.value)}
              multiline
              rows={2}
              fullWidth
              size={isMobile ? 'small' : 'medium'}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
          <Button onClick={() => setOpenRemoveDialog(false)} size={isMobile ? 'small' : 'medium'}>
            Annuler
          </Button>
          <Button
            onClick={handleRemoveStock}
            variant="contained"
            sx={{
              backgroundColor: '#ef4444',
              '&:hover': { backgroundColor: '#dc2626' },
            }}
            size={isMobile ? 'small' : 'medium'}
          >
            Retirer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: isMobile ? 'center' : 'left' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BloodStockManagement;