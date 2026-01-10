import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { Login } from './pages/login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { TodoList } from './pages/TodoList';
import { Profile } from './pages/Profile';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAppDispatch } from './store';
import { initializeAuth } from './store/slices/authSlice';

function AppInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);
  
  return <>{children}</>;
}

function App() {
  return (
    <Provider store={store}>
      <AppInitializer>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="todos" element={<TodoList />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster position="top-right" />
        </Router>
      </AppInitializer>
    </Provider>
  );
}

export default App;
