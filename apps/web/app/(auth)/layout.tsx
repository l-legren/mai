import { PropsWithChildren } from 'react';
import TopBar from '../components/auth/TopBar';

const AuthLayout = ({ children }: PropsWithChildren) => {
  console.log(children);

  return (
    <div>
      <TopBar />
      {children}
    </div>
  );
};

export default AuthLayout;
