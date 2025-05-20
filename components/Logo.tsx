"use client";
import { useRouter } from "next/navigation";

function Logo() {
  const router = useRouter();

  return (
    <div className="flex items-center cursor-pointer" onClick={() => router.push("/")}>
      <span style={{ color: '#facc15', fontWeight: 'bold', marginRight: '0rem' }}>hero</span>
      <span className="text-gray-500 font-semibold mr-1" style={{ position: 'relative', display: 'inline-block' }}>
        <span>au</span>
        <sub style={{
          position: 'absolute',
          left: 22,
          bottom: '0.2em',
          fontSize: '0.6em',
          color: '#6b7280'
        }}>
          app
        </sub>
        <span>dit</span>
      </span>
    </div>
  );
}

export default Logo;
