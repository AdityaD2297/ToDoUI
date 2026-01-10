import { authService } from '../services/authService';

// Test function to verify logout API
export const testLogout = async () => {
  try {
    console.log('Testing logout API...');
    await authService.logout();
    console.log('Logout API call successful');
    return true;
  } catch (error) {
    console.error('Logout API call failed:', error);
    return false;
  }
};

// Test function to check token handling
export const testTokenHandling = () => {
  const token = localStorage.getItem('access_token');
  console.log('Current token:', token ? 'exists' : 'none');
  
  // Simulate logout
  localStorage.removeItem('access_token');
  console.log('Token after removal:', localStorage.getItem('access_token') ? 'exists' : 'none');
  
  // Restore token if it existed
  if (token) {
    localStorage.setItem('access_token', token);
    console.log('Token restored');
  }
};
