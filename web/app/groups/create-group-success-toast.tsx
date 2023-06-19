'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { showSuccessToast } from '../../utils/toastUtils';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';

const OnPageInitSuccessToast: React.FC = () => {
  const showCreateGroupSuccessToast =
    Cookies.get('showCreateGroupSuccessToast') === 'true';
  const showProposeSuccessToast =
    Cookies.get('showProposeSuccessToast') === 'true';

  useEffect(() => {
    if (showCreateGroupSuccessToast) {
      showSuccessToast('Grup berhasil dibuat!');
      Cookies.remove('showCreateGroupSuccessToast');
    }
    if (showProposeSuccessToast) {
      showSuccessToast('Usulan berhasil dibuat!');
      Cookies.remove('showProposeSuccessToast');
    }
  }, []);

  return <div />;
};

export default OnPageInitSuccessToast;
