'use client';
import StartupOnboardingComponent from '@/components/StartupOnboarding';
import { useRouter } from 'next/navigation';

export default function StartupOnboardingPage() {
  const router = useRouter();
  
  return (
    <StartupOnboardingComponent onComplete={() => router.push('/startup/dashboard')} />
  );
}
