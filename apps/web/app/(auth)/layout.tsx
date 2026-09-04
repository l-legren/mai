import { PropsWithChildren } from 'react';

const AuthLayout = ({ children }: PropsWithChildren) => {
  return <div className="flex min-h-svh flex-col">{children}</div>;
};

export default AuthLayout;
