import dynamic from 'next/dynamic';

const TerminalLandingClient = dynamic(() => import('@/components/terminal/TerminalLandingClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white text-2xl">Loading TradeAI Tutor...</div>
    </div>
  ),
});

export default function TerminalLanding() {
  return <TerminalLandingClient />;
}