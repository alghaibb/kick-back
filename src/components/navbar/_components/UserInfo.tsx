import Image from "next/image";
import { memo, useState } from "react";

interface Props {
  firstName?: string | null;
  nickname?: string | null;
  email?: string | null;
  image?: string | null;
}

function UserInfo({ firstName, nickname, email, image }: Props) {
  const displayName = nickname || firstName || "Guest";
  const initials = firstName?.charAt(0)?.toUpperCase() || "?";
  const [imageLoading, setImageLoading] = useState(!!image);
  const [imageError, setImageError] = useState(false);

  const showImage = image && !imageError;

  return (
    <div className="flex items-center gap-3 border border-border bg-muted rounded-lg p-3">
      <div className="relative w-9 h-9">
        {showImage ? (
          <>
            {/* Loading skeleton */}
            {imageLoading && (
              <div className="absolute inset-0 rounded-full bg-muted-foreground/20 animate-pulse" />
            )}
            <Image
              src={image}
              alt={`${displayName}'s profile`}
              width={36}
              height={36}
              className={`rounded-full object-cover transition-opacity duration-200 ${
                imageLoading ? "opacity-0" : "opacity-100"
              }`}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
              priority
            />
          </>
        ) : (
          <div className="w-9 h-9 rounded-full bg-muted-foreground/10 flex items-center justify-center text-xs font-medium uppercase">
            {initials}
          </div>
        )}
      </div>
      <div className="text-sm min-w-0 flex-1">
        <p className="font-medium text-foreground truncate">{displayName}</p>
        <p className="text-muted-foreground text-xs truncate">{email}</p>
      </div>
    </div>
  );
}

export default memo(UserInfo);
