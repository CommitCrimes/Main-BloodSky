import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#008EFF', // Couleur active onglets
    },
    secondary: {
      main: '#5C7F9B', // Couleur texte onglets
    },
    background: {
      default: '#dfecf0', // Fond dashboard
      paper: 'rgba(255, 255, 255, 0.8)', // Fond cards
    },
    text: {
      primary: '#5C7F9B', // Texte onglets
    },
  },
  typography: {
    fontFamily: 'Share Tech, monospace',
    h1: {
      fontFamily: 'Iceland, cursive',
      fontWeight: 400,
    },
    h2: {
      fontFamily: 'Iceland, cursive', 
      fontWeight: 400,
    },
    h3: {
      fontFamily: 'Share Tech, monospace',
      fontWeight: 400,
    },
    h4: {
      fontFamily: 'Share Tech, monospace',
      fontWeight: 400,
    },
    h5: {
      fontFamily: 'Share Tech, monospace',
      fontWeight: 400,
    },
    h6: {
      fontFamily: 'Share Tech, monospace',
      fontWeight: 400,
    },
    body1: {
      fontFamily: 'Share Tech, monospace',
      fontWeight: 400,
    },
    body2: {
      fontFamily: 'Share Tech, monospace',
      fontWeight: 400,
    },
    button: {
      fontFamily: 'Share Tech, monospace',
      fontWeight: 400,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFBFB',
          color: '#5C7F9B',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 16px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: '#5C7F9B',
          fontFamily: 'Share Tech, monospace',
          '&.Mui-selected': {
            color: '#008EFF',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: 'Share Tech, monospace',
        },
        contained: {
          backgroundColor: '#008EFF',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#0066cc',
          },
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 16px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: 'rgba(92, 127, 155, 0.1)',
            color: '#5C7F9B',
            fontFamily: 'Share Tech, monospace',
            fontWeight: 600,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontFamily: 'Share Tech, monospace',
          borderBottom: '1px solid rgba(92, 127, 155, 0.1)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '20px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
        },
      },
    },
  },
});

export default theme;