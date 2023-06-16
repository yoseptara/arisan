import Center from '../components/Center';
import Loading from '../components/Loading';

export default function RootLoading() {
  return (
    <Center>
      <Loading isLoading={true} />
    </Center>
  );
}
