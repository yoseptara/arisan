import { useRouter } from 'next/router';
import { PrimaryBtn } from './PrimaryButton';

export default function BackToHomeBtn() {
  const router = useRouter();
  const onClick = () => {};
  return <PrimaryBtn text="Beranda" className="w-full" />;
}
