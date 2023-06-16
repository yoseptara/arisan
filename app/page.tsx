import GroupsPage from './groups/page';

export const dynamic = 'force-dynamic';

export default async function IndexPage() {
  return GroupsPage();
}
