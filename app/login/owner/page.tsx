import StaffLoginForm from "../../../components/StaffLoginForm";

export default function OwnerLoginPage() {
  return (
    <StaffLoginForm
      role="owner"
      title="Masuk Owner"
      subtitle="Akses khusus pemilik platform JakSky. Data login tidak ditampilkan untuk keamanan."
      redirectTo="/owner"
    />
  );
}
