import { Metadata } from "next";
import ProfilePage from "./ProfilePage";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your profile settings and account information",
};

export default function Page() {
  return <ProfilePage />;
}
