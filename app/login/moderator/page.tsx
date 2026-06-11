import StaffLoginForm from "../../../components/StaffLoginForm";

export default function ModeratorLoginPage() {
  return (
    <StaffLoginForm
      role="moderator"
      title="Masuk Moderator"
      subtitle="Pantau komentar dan jaga komunitas JakSky tetap aman."
      redirectTo="/moderator"
    />
  );
}
