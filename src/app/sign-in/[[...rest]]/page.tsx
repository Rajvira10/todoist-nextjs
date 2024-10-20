import { SignIn } from "@clerk/nextjs";


const SignInRoute = () => {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-80px)]">
      <SignIn />
    </div>
  );
};

export default SignInRoute;
