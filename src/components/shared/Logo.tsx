import Image from 'next/image'

interface LogoProps {
  className?: string
  size?: number
}

export function Logo({ className = '', size = 80 }: LogoProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Image
        src="/eliade-logo.jpg"
        alt="Mircea Eliade School Logo"
        width={size}
        height={size}
        className="rounded-full"
        priority
      />
    </div>
  )
}

