import { cn } from '../lib/utils';

export function Background() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-black pointer-events-none">
      {/* Deep Gold Orb */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full bg-[#c9a84c] opacity-[0.04] blur-[180px] will-change-transform md:animate-orb-1 transform -translate-x-1/4 translate-y-1/4"
      />

      {/* Dark Navy Orb */}
      <div
        className="absolute w-[700px] h-[700px] rounded-full bg-[#1a1a2e] opacity-[0.07] blur-[200px] will-change-transform md:animate-orb-2 transform translate-x-full translate-y-1/2"
      />

      {/* Secondary Gold Orb */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full bg-[#c9a84c] opacity-[0.03] blur-[160px] will-change-transform md:animate-orb-3 transform translate-x-1/2 -translate-y-1/4"
      />

      {/* Gold Dust Particles */}
      <div className="absolute inset-0 opacity-10 pointer-events-none hidden md:block">
        {[
          { top: '20%', left: '10%', delay: '0s', duration: '10s' },
          { top: '40%', left: '80%', delay: '2s', duration: '14s' },
          { top: '70%', left: '30%', delay: '4s', duration: '18s' },
          { top: '10%', left: '60%', delay: '1s', duration: '12s' },
          { top: '80%', left: '90%', delay: '3s', duration: '16s' },
          { top: '50%', left: '50%', delay: '5s', duration: '20s' },
          { top: '30%', left: '20%', delay: '2.5s', duration: '15s' },
          { top: '60%', left: '70%', delay: '1.5s', duration: '13s' },
        ].map((pos, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#c9a84c] rounded-full animate-dust"
            style={{
              top: pos.top,
              left: pos.left,
              animationDelay: pos.delay,
              animationDuration: pos.duration
            }}
          />
        ))}
      </div>
    </div>
  );
}
