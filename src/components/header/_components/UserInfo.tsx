import Image from "next/image";

interface Props {
  firstName?: string | null;
  nickname?: string | null;
  email?: string | null;
  image?: string | null;
}

export default function UserInfo({ firstName, nickname, email, image }: Props) {
  const displayName = nickname || firstName || "Guest";

  return (
    <div className="flex items-center gap-3 p-4 border-b">
      {image ? (
        <Image
          src={image}
          alt="Profile"
          width={36}
          height={36}
          className="object-cover rounded-full"
          loading="lazy"
        />
      ) : (
        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-medium uppercase">
          {firstName?.charAt(0) || "?"}
        </div>
      )}
      <div className="text-sm">
        <p className="font-medium text-foreground">{displayName}</p>
        <p className="text-muted-foreground text-xs">{email}</p>
      </div>
    </div>
  );
}
