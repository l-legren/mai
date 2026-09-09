import { AuthForm, AuthHeader, ModeSwitch } from '@/app/components/auth';
import { Logo } from '@/app/components/ui';

const SignUpPage = () => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-bg px-6 py-16">
      <div className="flex w-full max-w-sm flex-col items-center gap-9">
        <Logo />
        <AuthHeader mode="signup" />
        <AuthForm mode="signup" />
        <ModeSwitch mode="signup" />
      </div>
    </div>
  );
};

export default SignUpPage;
