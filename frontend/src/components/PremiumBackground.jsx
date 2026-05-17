/**
 * Premium SaaS / rental background: dark gradient, light lines, car silhouette, glass orbs.
 * @param {'fleet' | 'details' | 'aurora' | 'midnight' | 'carbon'} variant
 *   fleet/details — основні сторінки; aurora/midnight/carbon — альтернативні преміум-стилі
 */
const PremiumBackground = ({ variant = 'fleet' }) => {
  return (
    <div
      className={`premium-bg premium-bg--${variant}`}
      aria-hidden="true"
    >
      <div className="premium-bg__base" />

      <div className="premium-bg__glow premium-bg__glow--1" />
      <div className="premium-bg__glow premium-bg__glow--2" />

      <div className="premium-bg__lines">
        {[...Array(12)].map((_, i) => (
          <span key={i} className="premium-bg__line" style={{ '--i': i }} />
        ))}
      </div>

      <div className="premium-bg__mesh">
        <span className="premium-bg__shard" />
        <span className="premium-bg__shard premium-bg__shard--2" />
        <span className="premium-bg__shard premium-bg__shard--3" />
      </div>

      <svg
        className="premium-bg__car-silhouette"
        viewBox="0 0 800 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMax meet"
      >
        <path
          d="M40 200h48l28-52c12-22 36-38 64-38h88c28 0 52 16 64 38l28 52h52c22 0 40 18 40 40v12H40v-52c0-22 18-40 40-40z"
          fill="currentColor"
        />
        <circle cx="180" cy="212" r="36" fill="currentColor" opacity="0.85" />
        <circle cx="580" cy="212" r="36" fill="currentColor" opacity="0.85" />
        <path
          d="M200 110h120l24 40H176l24-40z"
          fill="currentColor"
          opacity="0.5"
        />
      </svg>

      <div className="premium-bg__glass premium-bg__glass--1" />
      <div className="premium-bg__glass premium-bg__glass--2" />
      <div className="premium-bg__glass premium-bg__glass--3" />
      <div className="premium-bg__glass premium-bg__glass--4" />

      <div className="premium-bg__vignette" />
    </div>
  );
};

export default PremiumBackground;
