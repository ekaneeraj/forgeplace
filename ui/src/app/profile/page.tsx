import type { Metadata } from "next";
import { ProfilePage } from "@/components/organisms/ProfilePage";

export const metadata: Metadata = {
  title: "Profile | ForgePlace",
  description:
    "Manage your owned NFTs, tokens, collections and wallet settings on ForgePlace.",
};

export default function ProfileRoute() {
  return <ProfilePage />;
}