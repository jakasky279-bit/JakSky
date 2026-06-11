import StaffLoginForm from "../../../components/StaffLoginForm";

export default function AdminLoginPage() {
  return (
    <StaffLoginForm
      role="admin"
      title="Masuk Admin"
      subtitle="Kelola konten, upload video, dan pengaturan platform."
      redirectTo="/admin"
    />
  );
}
