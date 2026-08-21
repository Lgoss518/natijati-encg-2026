import { isAdmin } from "../../lib/admin-auth";
import AdminDashboard from "./AdminDashboard";
import AdminLogin from "./AdminLogin";

export const dynamic="force-dynamic";

export default async function AdminPage(){
  if(!await isAdmin()) return <AdminLogin/>;
  return <AdminDashboard email="Administrateur"/>;
}
