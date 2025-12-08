import { useLocalSearchParams } from 'expo-router';
import AthleteDashboardScreen from '@/components/athlete-dashboard-screen';

export default function AthleteView() {
  const { playerId, playerName } = useLocalSearchParams<{
    playerId?: string;
    playerName?: string;
  }>();

  return (
    <AthleteDashboardScreen
      playerName={playerName || undefined}
      isCoachView={true}
    />
  );
}

