const LOGIN_IMAGE = "/images/login/Interior%20Woods.jpg";

export function LoginBrandPanel() {
  return (
    <div
      className="login-brand-enter relative min-h-[42vh] w-full sm:min-h-[48vh] lg:sticky lg:top-0 lg:h-screen lg:min-h-0"
      aria-hidden
    >
      <img
        src={LOGIN_IMAGE}
        alt=""
        width={1779}
        height={2560}
        decoding="async"
        fetchPriority="high"
        className="h-full w-full object-cover object-center"
      />
    </div>
  );
}
