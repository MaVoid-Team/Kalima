import { useParams } from "react-router-dom";
import AdminEBookletInstancesPage from "./AdminEBookletInstancesPage";

export default function AdminEBookletTeacherAccessPage() {
  const { teacherId } = useParams();
  return <AdminEBookletInstancesPage teacherId={teacherId} />;
}
