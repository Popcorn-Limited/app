export function roundToFixed(value, decimals) {
    const multiplier = Math.pow(10, decimals);
    return Math.round(value * multiplier) / multiplier;
}

export function normalizeVotes(votes) {
    // Take absolute values of the input votes
    let absoluteVotes = votes.map(vote => Math.abs(vote));

    // Calculate total sum
    let totalSum = absoluteVotes.reduce((sum, vote) => sum + vote, 0);

    // If total is 0, return an array of zeros
    if (totalSum === 0) {
        return absoluteVotes.map(() => 0);
    }

    // Normalize the votes based on their proportion to total
    let normalizedVotes = absoluteVotes.map(vote => (vote / totalSum) * 10000);

    // Adjust for rounding errors to ensure total equals 10,000
    let error = 10000 - normalizedVotes.reduce((sum, vote) => sum + Math.round(vote), 0);
    let maxIndex = normalizedVotes.indexOf(Math.max(...normalizedVotes));
    normalizedVotes[maxIndex] += error;

    // Round the values and ensure all are between 1 and 10,000
    let resultVotes = normalizedVotes.map(vote => {
        let rounded = Math.round(vote);
        return Math.min(10000, Math.max(1, rounded));
    });

    return resultVotes;
}




