"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";

function Logo() {
  const router = useRouter();

  const handleClick = () => {
    router.push("/"); // Navega normalmente sem forçar estado de loading
  };

  return (
    <div
      className="flex items-center cursor-pointer min-h-[70px] min-w-[150px]"
      onClick={handleClick}
    >
      <Image
        src="/logo.png"
        alt="HeroAudit Logo"
        width={150}
        height={70}
        priority
      />
    </div>
  );
}

export default Logo;
