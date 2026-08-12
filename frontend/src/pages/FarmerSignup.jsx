import AuthForm from '../components/auth/AuthForm'

export default function FarmerSignup({ onNavigate, onSignupSuccess }) {
  return <AuthForm role="farmer" mode="signup" onNavigate={onNavigate} onSuccess={onSignupSuccess} />
}
