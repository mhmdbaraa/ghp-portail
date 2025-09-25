import { useEffect } from 'react';
import { useNavigation } from '../../shared/contexts/NavigationContext';
import {
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
