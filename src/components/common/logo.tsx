interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
  className?: string
}

export default function Logo({ size = 'md', showName = true, className = '' }: LogoProps) {
  const sizeMap = {
    sm: { width: 32, height: 32 },
    md: { width: 64, height: 64 },
    lg: { width: 128, height: 128 }
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <img
        src="/images/logo-insan-cendekia.png"
        alt="Logo Insan Cendekia Nusantara"
        width={sizeMap[size].width}
        height={sizeMap[size].height}
        className="rounded-lg object-contain"
        style={{ background: 'transparent' }}
      />
      {showName && (
        <div className="mt-3 text-center">
          <h1 className={`font-bold text-red-600 ${
            size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-3xl'
          }`}>
            Insan Cendekia Nusantara
          </h1>
        </div>
      )}
    </div>
  )
}