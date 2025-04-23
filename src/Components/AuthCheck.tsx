import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Notification from './Notification';

interface AuthCheckProps {
  children: React.ReactNode;
}

const AuthCheck: React.FC<AuthCheckProps> = ({ children }) => {
  const navigate = useNavigate();
  const [authMessage, setAuthMessage] = useState<
    | {
        text: string;
        type: 'success' | 'info' | 'warning' | 'error';
      }
    | null
  >(null);

  useEffect(() => {
    const checkAuthToken = async () => {
      const token = sessionStorage.getItem('token');

      if (token) {
        try {
          const response = await axios.post(
            'http://localhost:3000/server/ransommonitor/authtoken',
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.status !== 200 || !response.data.isValid) {
            console.log('Token not valid or request failed.');
            setAuthMessage({
              text: 'You are not authorized. Redirecting to login...',
              type: 'error',
            });
            setTimeout(() => {
              navigate('/app');
            }, 2000);
          } else {
            console.log('Token is valid.');
          }
        } catch (error) {
          console.error('Error checking auth token:', error);
          setAuthMessage({
            text: 'Authentication check failed. Redirecting to login...',
            type: 'error',
          });
          setTimeout(() => {
            navigate('/app');
          }, 2000);
        }
      } else {
        console.log('No token found in sessionStorage.');
        setAuthMessage({
          text: 'Please log in First. Redirecting to login...',
          type: 'warning',
        });
        setTimeout(() => {
          navigate('/app');
        }, 3000);
      }
    };

    checkAuthToken();
  }, [navigate]);

  const handleCloseNotification = () => {
    setAuthMessage(null);
  };

  return (
    <>
      {authMessage && (
        <Notification message={authMessage} onClose={handleCloseNotification} />
      )}
      {!authMessage && <>{children}</>}
    </>
  );
};

export default AuthCheck;