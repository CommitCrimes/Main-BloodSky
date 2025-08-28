import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import SuperAdminInviteForm from './SuperAdminInviteForm';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const SuperAdminAdminManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  return (
    <Box p={3}>
      <Typography variant="h4" component="h1" gutterBottom>
        Gestion des Administrateurs
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Inviter Admin Hôpital" />
          <Tab label="Inviter Admin Centre de Don" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Card sx={{ maxWidth: 800, mx: 'auto' }}>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              Inviter un Administrateur d'Hôpital
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <SuperAdminInviteForm type="hospital" />
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Card sx={{ maxWidth: 800, mx: 'auto' }}>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              Inviter un Administrateur de Centre de Don
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <SuperAdminInviteForm type="donation_center" />
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
};

export default SuperAdminAdminManagement;