import { AiLevel, PlayMode } from "../prisma/generated/prisma/enums";

export const XP_SCALE = 10;

const XP_MULTIPLIER_UNITS = {
    [PlayMode.LOCAL]: XP_SCALE,
    [PlayMode.AI]: {
        [AiLevel.HARD]: 8,
        [AiLevel.MID]: 5,
        [AiLevel.EASY]: 2,
    },
} as const;

type CalculateXpInput = {
    userScore: number;
    opponentScore: number;
    playMode: PlayMode;
    aiLevel: AiLevel;
};

export const calculateXp = ({ userScore, opponentScore, playMode, aiLevel }: CalculateXpInput): number => {
    // No negative XP: losses/draws yield 0 internal units.
    const scoreDiff = Math.max(userScore - opponentScore, 0);

    const multiplier = playMode === PlayMode.LOCAL
        ? XP_MULTIPLIER_UNITS.LOCAL
        : XP_MULTIPLIER_UNITS.AI[aiLevel];

    return scoreDiff * multiplier;
};

export const displayXpFromUnits = (xpUnits: number): number => {
    return xpUnits / XP_SCALE;
};
