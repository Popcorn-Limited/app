export function roundToFixed(value, decimals) {
    const multiplier = Math.pow(10, decimals);
    return Math.round(value * multiplier) / multiplier;
}

export function normalizeVotes(votes) {
    let roundedVotes = votes.map(vote => Math.round(vote));
    roundedVotes = roundedVotes.map(vote => Math.min(10000, Math.max(1, vote)));

    let totalVotes = roundedVotes.reduce((sum, vote) => sum + vote, 0);
    while (totalVotes > 10000) {
        const maxIndex = roundedVotes.indexOf(Math.max(...roundedVotes));
        roundedVotes[maxIndex] -= totalVotes - 10000;
        totalVotes = roundedVotes.reduce((sum, vote) => sum + vote, 0);
    }

    roundedVotes = roundedVotes.map(value => value * 10);
    if (roundedVotes.reduce((sum, vote) => sum + vote, 0) > 10000) {
        roundedVotes[roundedVotes.indexOf(Math.max(...roundedVotes))] -= 10;
    }

    return roundedVotes;
}



