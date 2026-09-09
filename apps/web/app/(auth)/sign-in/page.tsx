import { AuthForm, AuthHeader, ModeSwitch } from '@/app/components/auth';
import { Logo } from '@/app/components/ui';

const SignInPage = () => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-bg px-6 py-16">
      <div className="flex w-full max-w-sm flex-col items-center gap-9">
        <Logo />
        <AuthHeader mode="signin" />
        <AuthForm mode="signin" />
        <ModeSwitch mode="signin" />
      </div>
    </div>
  );
};

export default SignInPage;
