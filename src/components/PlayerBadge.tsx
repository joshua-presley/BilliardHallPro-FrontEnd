import { Badge } from '@mantine/core';
import type { Player } from '../types/models/Player';

interface PlayerBadgeProps {
  player: Player;
}

// Placeholder implementation — replace with the real PlayerBadge design later
function PlayerBadge({ player }: PlayerBadgeProps) {
  return <Badge variant="light">{player.first_name}</Badge>;
}

export default PlayerBadge;