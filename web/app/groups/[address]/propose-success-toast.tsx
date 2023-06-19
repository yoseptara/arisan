'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';
import { showSuccessToast } from '@root/utils/toastUtils';

const OnPageInitSuccessToast: React.FC = () => {
  const showToast = Cookies.get('showProposeSuccessToast') === 'true';

  useEffect(() => {
    if (showToast) {
      showSuccessToast('Usulan berhasil dibuat!');
      Cookies.remove('showProposeSuccessToast');
    }
  }, []);

  return <div />;
};

export default OnPageInitSuccessToast;
