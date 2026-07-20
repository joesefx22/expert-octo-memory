export default function AdminUsersTable({ users }: any) { return <table><tbody>{users.map((u: any) => <tr key={u.id}><td>{u.email}</td></tr>)}</tbody></table> }
