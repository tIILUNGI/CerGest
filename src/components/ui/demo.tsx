import LoginForm from "@/components/ui/login-form";

export default function DemoOne() {
  return (
    <LoginForm 
      onLogin={(email, password) => {
        console.log("Logged in:", email, password);
      }} 
      onCreateAccount={(data) => {
        console.log("Account created:", data);
      }}
      onForgotPassword={(data) => {
        console.log("Password recovery:", data);
      }}
    />
  );
}
