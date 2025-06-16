import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Paper,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Card,
  CardContent
} from '@mui/material';
import { Computer, CheckCircle, Error } from '@mui/icons-material';
import axios from 'axios';

interface ServerResponse {
  message: string;
  status: string;
  timestamp: string;
}

function App() {
  const [data, setData] = useState<ServerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  const fetchServerMessage = async () => {
    try {
      setLoading(true);
      setConnectionStatus('connecting');
      
      const response = await axios.get('http://localhost:8080/get');
      setData(response.data);
      setConnectionStatus('connected');
      setError(null);
    } catch (err) {
      setError('Failed to connect to server. Make sure the server is running on port 8080.');
      setConnectionStatus('error');
      console.error('Connection error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServerMessage();
    
    // Refresh every 10 seconds to show live connection
    const interval = setInterval(fetchServerMessage, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div>
      <AppBar position="static" sx={{ bgcolor: '#1976d2' }}>
        <Toolbar>
          <Computer sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Development Server Test Client
          </Typography>
          <Chip
            icon={connectionStatus === 'connected' ? <CheckCircle /> : <Error />}
            label={connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'error' ? 'Disconnected' : 'Connecting...'}
            color={connectionStatus === 'connected' ? 'success' : connectionStatus === 'error' ? 'error' : 'warning'}
            variant="outlined"
            sx={{ color: 'white', borderColor: 'white' }}
          />
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" gutterBottom>
            🚧 Server Connection Test
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Testing connection to development server on localhost:8080
          </Typography>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ ml: 2 }}>
              Connecting to server...
            </Typography>
          </Box>
        ) : error ? (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            action={
              <Chip 
                label="Retry" 
                color="error" 
                variant="outlined" 
                onClick={fetchServerMessage}
                sx={{ cursor: 'pointer' }}
              />
            }
          >
            {error}
          </Alert>
        ) : data ? (
          <Card elevation={3}>
            <CardContent>
              <Box textAlign="center" py={3}>
                <Typography variant="h5" gutterBottom color="primary">
                  📡 Server Response
                </Typography>
                
                <Paper elevation={1} sx={{ p: 3, mt: 2, bgcolor: '#f5f5f5' }}>
                  <Typography variant="h6" gutterBottom>
                    Message:
                  </Typography>
                  <Typography variant="body1" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    "{data.message}"
                  </Typography>
                </Paper>

                <Box mt={3} display="flex" justifyContent="space-around" flexWrap="wrap" gap={2}>
                  <Box textAlign="center">
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip 
                      label={data.status} 
                      color="warning" 
                      variant="outlined"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  
                  <Box textAlign="center">
                    <Typography variant="subtitle2" color="text.secondary">
                      Timestamp
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {formatTimestamp(data.timestamp)}
                    </Typography>
                  </Box>
                  
                  <Box textAlign="center">
                    <Typography variant="subtitle2" color="text.secondary">
                      Server URL
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, fontFamily: 'monospace' }}>
                      localhost:8080/get
                    </Typography>
                  </Box>
                </Box>

                <Box mt={4}>
                  <Typography variant="body2" color="text.secondary">
                    ✅ Connection successful! The development server is responding correctly.
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Auto-refreshes every 10 seconds
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ) : null}

        <Box mt={4} textAlign="center">
          <Typography variant="h6" gutterBottom>
            🎯 Ready for Development
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            This client successfully connects to your development server. 
            You can now use Cursor to extend both the server API and this client 
            to build the full banking application according to the BANK_API.md documentation.
          </Typography>
        </Box>
      </Container>
    </div>
  );
}

export default App;
