const XP_REWARD = {
    win: 50,
    loss: 10,
} as const;

type CalculateXpInput = {
    userScore: number;
    opponentScore: number;
};

export const calculateXp = ({ userScore, opponentScore }: CalculateXpInput): number => {
    return userScore > opponentScore ? XP_REWARD.win : XP_REWARD.loss;
};

