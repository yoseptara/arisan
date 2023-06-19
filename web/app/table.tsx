import {
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Text
} from '@tremor/react';

interface User {
  walletAddress: string;
  telegramUsername: string;
}

export default async function UsersTable({ users }: { users: User[] }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Wallet Address</TableHeaderCell>
          <TableHeaderCell>Telegram Username</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.walletAddress}>
            <TableCell>{user.walletAddress}</TableCell>
            <TableCell>
              <Text>{user.telegramUsername}</Text>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
