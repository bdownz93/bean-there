import { UserProfileClient } from "@/components/profile/user-profile-client"

interface ProfilePageProps {
  params: {
    username: string
  }
}

export default function ProfilePage({ params }: ProfilePageProps) {
  return <UserProfileClient username={params.username} />
}

export function generateStaticParams() {
  return [
    { username: "coffeemaster" },
    { username: "beanqueen" },
    { username: "brewmaster" }
  ]
}