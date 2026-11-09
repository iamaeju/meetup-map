export default function BrandLogo({ className = '', iconOnly = false }) {
  return (
    <span className={`brand ${className}`}>
      <img src="/brand-icon-original.jpg" alt="까치" className="brand-icon" />
      {!iconOnly && '까치 로컬 커뮤니티'}
    </span>
  );
}
