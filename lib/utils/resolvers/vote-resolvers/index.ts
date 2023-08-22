export function roundToFixed(value, decimals) {
    const multiplier = Math.pow(10, decimals);
    return Math.round(value * multiplier) / multiplier;
}

export function normalizeVotes(votes) {
    let roundedVotes = votes.map(vote => roundToFixed(vote, 0));
    const totalVotes = roundedVotes.reduce((sum, vote) => sum + vote, 0);

    if (totalVotes <= 100) return roundedVotes;

    // Calculate the excess votes
    const excessVotes = totalVotes - 100;

    // Find the index of the largest vote
    const maxIndex = roundedVotes.indexOf(Math.max(...roundedVotes));

    // Adjust the largest vote by subtracting the excess
    roundedVotes[maxIndex] -= excessVotes;

    return roundedVotes;
}