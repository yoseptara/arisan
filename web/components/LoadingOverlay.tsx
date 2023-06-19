import React from 'react';
import { CircleSpinnerOverlay } from 'react-spinner-overlay';

interface LoadingOverlayProps {
  isLoading: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading }) => {
  return (
    <CircleSpinnerOverlay
      loading={isLoading}
      color="rgba(0,0,0,1)"
      overlayColor="rgba(211, 211, 211, 0.5)"
    />
  );
};

export default LoadingOverlay;
