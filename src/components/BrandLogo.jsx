export default function BrandLogo({ className = '', iconOnly = false }) {
  return (
    <span className={`brand ${className}`}>
      <img src="/brand-icon-original.jpg" alt="까치" className="brand-icon" />
      {!iconOnly && '까치 팝미팅'}
    </span>
  );
}
