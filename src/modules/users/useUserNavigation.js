import { useEffect } from 'react';
import { useNavigation } from '../../shared/contexts/NavigationContext';
import {
  Dashboard,
  People,
  Shield,
  Security,
} from '@mui/icons-material';

export const useUserNavigation = (skipNavigation = false) => {
  const { setModule } = useNavigation();

  useEffect(() => {
    if (skipNavigation) {
      return;
    }

    const userNavigationItems = [
      {
        path: '/users/dashboard',
        label: 'Tableau de bord',
        icon: Dashboard
      },
      {
        path: '/users/list',
        label: 'Utilisateurs',
        icon: People
      },
      {
        path: '/users/permissions',
        label: 'Permissions',
        icon: Shield
      },
      {
        path: '/users/roles',
        label: 'Rôles',
        icon: Security
      }
    ];

    setModule('users', userNavigationItems);

    // Cleanup function to reset navigation when component unmounts
    return () => {
      setModule('dashboard', []);
    };
  }, [setModule, skipNavigation]);
};
