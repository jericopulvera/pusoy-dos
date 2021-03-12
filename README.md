# Pusoy Dows

# Data Model

## Game
```
{
    id: Number,
    status: ['Waiting', 'Ongoing', 'Completed'],
    players: [
        {
            player: Number,
            cards: {
                'A-Spades': {
                    playedAt: new Date(),
                }
            }
        }
    ]
}
```



