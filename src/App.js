import React from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:8080');
const App = () => {
    // const [socket, setSocket] = React.useState(io('http://localhost:8080'))
    const [initialStateOfGame, setInitialState] = React.useState(true);
    const [cardsLength, setCardsLength] = React.useState(0);
    const [username, setUsername] = React.useState(socket.id);
    const [randomCard, setRandomCard] = React.useState({});
    const [canPlay, setCanPlay] = React.useState(false);
    const [currentPlayer, setCurrentPlayer] = React.useState(undefined);
    const [socketConnected, setSocketConnected] = React.useState(false);

    function handleSelectRandomCard() {
        console.log('Generating a random number');
        const random_number = Math.round(Math.random() * (cardsLength - 1));
        console.log(random_number);
        socket.emit('select-random-card', random_number);
        socket.emit('update-player-turn', { id: socket.id, play: true });
        setCanPlay(false);
    }

    function startPlaying() {
        socket.emit('generate-player-turn');
    }
    function handleSaveUsername() {
        if (username !== '') {
            console.log('Emitting update-username');
            socket.emit('update-username', username);
            console.log('Finished emitting update-username');
            socket.username = username;
            setUsername('');
        }
    }

    React.useEffect(() => {
        if (!socket) return;

        socket.on('connect', () => setSocketConnected(true))

        socket.on('disconnect', () => setSocketConnected(false))

        socket.on('send-cards-length', data => {
            data = JSON.parse(data);
            setCardsLength(data);
        });
        socket.on('send-default-selected-card', data => setRandomCard(data));
        socket.on('send-random-card', data => {
            console.log(data);
            setRandomCard(data);
        });
        socket.on('select-player-turn', (data) => {
            setCanPlay(true);
            // setCurrentPlayer(data.username && data.username || data.id);
        });
        socket.on('player-selected', data => {
            setInitialState(false);
            setCurrentPlayer(data.username && data.username || data.id);
        });
        socket.on('available-turn', data => {
            console.log('canPlay:', data);
            setCanPlay(data);
        });
        socket.on('update-player-turn', data => setCanPlay(true));
        socket.on('disable-turn', () => setCanPlay(false));
        socket.on('update-current-player-username', data => setCurrentPlayer(data));
    }, [])
    return (
        <>
            <div>
                {socket.username ? <span>Your name: {socket.username}</span> : <span>Your ID: {socket.id}</span>}
            </div>
            <label htmlFor='username'>
                <input type="text" placeholder='Change your username here' onChange={e => setUsername(e.target.value)} />
                <button onClick={handleSaveUsername}>Save</button>
            </label>
            <span>{socketConnected ? 'Connected' : 'Disconnected'}</span>
            <div />
            {
                initialStateOfGame && <button onClick={startPlaying}>Start playing</button>
            }
            {/* <button onClick={!canPlay ? generatePlayerTurn : handleSelectRandomCard} disabled={!canPlay}>{!canPlay ? 'Not your turn' : 'Select random card'} </button> */}
            <button onClick={handleSelectRandomCard} disabled={!canPlay}>{!canPlay ? 'Not your turn' : 'Select random card'}</button>
            <div />
            {/* {!initialStateOfGame && <span>It's {currentPlayer} turn!</span>} */}
            {/* <span> {!initialStateOfGame && currentPlayer} </span> */}
            <div />
            {randomCard !== {} && !initialStateOfGame ? <span>{randomCard?.question}</span> : null}
        </>
    )
}

export default App;