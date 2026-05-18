import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth/hooks/use-auth";

interface UserAvatarProps {
  className?: string;
  showName?: boolean;
}

export function UserAvatar({ className, showName = true }: UserAvatarProps) {
  const { user } = useAuth();

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    return user?.email?.[0]?.toUpperCase() ?? "U";
  };

  const getFullName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.email ?? "Użytkownik";
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showName && <span className="text-sm font-medium">{getFullName()}</span>}
      <Avatar>
        <AvatarImage
          src={user ? `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}` : undefined}
          alt={getFullName()}
        />
        <AvatarFallback>{getInitials()}</AvatarFallback>
      </Avatar>
    </div>
  );
}
