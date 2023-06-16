import React from 'react';
import { CircleSpinner } from 'react-spinner-overlay';

interface LoadingProps {
  isLoading: boolean;
}

const Loading: React.FC<LoadingProps> = ({ isLoading }) => {
  return <CircleSpinner loading={isLoading} color="rgba(0,0,0,1)" />;
};

export default Loading;
