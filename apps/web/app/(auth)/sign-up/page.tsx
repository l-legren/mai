import AuthForm from '@/app/components/auth/AuthForm';
import AuthHeader from '@/app/components/auth/AuthHeader';
import ModeSwitch from '@/app/components/auth/ModeSwitch';
import Logo from '@/app/components/ui/Logo';

const SignUpPage = () => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-[#171316] px-6 py-16">
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
