import { SignUp } from '@clerk/nextjs';

const SignUpPage = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <SignUp />
    </div>
  );
};

export default SignUpPage;