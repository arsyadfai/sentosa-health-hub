import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(`/${user.role}`);
    } else {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="h-12 w-12 mx-auto mb-4 animate-pulse-soft rounded-full bg-primary" />
        <p className="text-muted-foreground">Memuat...</p>
      </div>
    </div>
  );
};

export default Index;
