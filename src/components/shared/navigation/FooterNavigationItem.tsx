import Image from 'next/image';
import Link from 'next/link';

interface FooterNavigationItemProps {
  href: string;
  iconSrc: string;
  alt: string;
  isActive: boolean;
}

export const FooterNavigationItem = ({
  href,
  iconSrc,
  alt,
  isActive,
}: FooterNavigationItemProps) => {
  return (
    <Link
      href={href}
      className={`flex items-center justify-center p-2 rounded-full ${
        isActive ? 'bg-blue-100' : 'bg-white'
      }`}
    >
      <div className="w-7 h-7 relative">
        <Image src={iconSrc} alt={alt} width={28} height={28} />
      </div>
    </Link>
  );
};
