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
      paper: '#FBBDBE', // Fond cards
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
          backgroundColor: '#FBBDBE',
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
      },
    },
  },
});

export default theme;