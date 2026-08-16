export function VoiceWave({ bars = 9, className = "" }: { bars?: number; className?: string }) {
  return (
    <div className={`flex h-10 items-center justify-center gap-1 ${className}`} aria-hidden>
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className="w-1.5 origin-center rounded-full bg-leaf animate-wave"
          style={{ height: `${18 + (i % 4) * 8}px`, animationDelay: `${i * 90}ms` }}
        />
      ))}
    </div>
  );
}
