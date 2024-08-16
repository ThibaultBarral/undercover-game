'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { readExcelFile } from '../../utils/readExcel';

export default function Game() {
    const [players, setPlayers] = useState([]);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [wordToShow, setWordToShow] = useState("");
    const [words, setWords] = useState([]);
    const [assignedWords, setAssignedWords] = useState([]);
    const [gameOver, setGameOver] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [impostorIndex, setImpostorIndex] = useState(null);
    const [scores, setScores] = useState({});
    const [gameRunning, setGameRunning] = useState(true);
    const [roundFinished, setRoundFinished] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchWords = async () => {
            const wordsData = await readExcelFile('/undercover_mots_francais.xlsx');
            setWords(wordsData);
        };

        const playersFromStorage = JSON.parse(localStorage.getItem('players'));
        if (playersFromStorage) {
            setPlayers(playersFromStorage);
            fetchWords();  // Fetch words when the component mounts

            // Initialize scores if not already set
            const initialScores = playersFromStorage.reduce((acc, player) => {
                acc[player] = 0;
                return acc;
            }, {});
            setScores(initialScores);
        } else {
            router.push('/');
        }
    }, [router]);

    const assignWords = () => {
        if (words.length === 0 || players.length === 0) return;

        const randomIndex = Math.floor(Math.random() * words.length);
        const [commonWord, undercoverWord] = words[randomIndex];

        // Pick a random player to be the impostor
        const impostorIdx = Math.floor(Math.random() * players.length);
        setImpostorIndex(impostorIdx);

        const wordsAssigned = players.map((_, index) =>
            index === impostorIdx ? undercoverWord : commonWord
        );

        setAssignedWords(wordsAssigned);
    };

    const showWord = () => {
        if (assignedWords.length === 0) {
            assignWords();
        }
        setWordToShow(assignedWords[currentPlayerIndex]);
    };

    const nextPlayer = () => {
        setWordToShow("");
        if (currentPlayerIndex + 1 >= players.length) {
            setGameOver(true);
        } else {
            setCurrentPlayerIndex(currentPlayerIndex + 1);
        }
    };

    const handleVote = (player) => {
        setSelectedPlayer(player);
    };

    const revealImpostor = () => {
        const actualImpostor = players[impostorIndex];
        if (selectedPlayer === actualImpostor) {
            alert(`${selectedPlayer} était bien l'imposteur !`);

            // Tous les joueurs sauf l'imposteur gagnent 1 point
            setScores((prevScores) => {
                const updatedScores = { ...prevScores };
                players.forEach((player, index) => {
                    if (index !== impostorIndex) {
                        updatedScores[player] += 1;
                    }
                });
                return updatedScores;
            });
        } else {
            alert(`${selectedPlayer} n'était pas l'imposteur. L'imposteur était ${actualImpostor}.`);

            // L'imposteur gagne 2 points
            setScores((prevScores) => ({
                ...prevScores,
                [actualImpostor]: prevScores[actualImpostor] + 2,
            }));
        }

        // Marquer la manche comme terminée pour afficher l'étape intermédiaire
        setRoundFinished(true);
    };

    const stopGame = () => {
        setGameRunning(false);
    };

    const continueGame = () => {
        // Réinitialiser pour la prochaine manche
        setGameOver(false);
        setCurrentPlayerIndex(0);
        setAssignedWords([]);
        setSelectedPlayer(null);
        setRoundFinished(false);
        assignWords();
    };

    if (!gameRunning) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
                <h2 className="text-2xl font-bold mb-4">Tableau des Scores</h2>
                <table className="table-auto bg-white shadow-md rounded-lg">
                    <thead>
                        <tr>
                            <th className="px-4 py-2">Joueur</th>
                            <th className="px-4 py-2">Points</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(scores).map(([player, score]) => (
                            <tr key={player}>
                                <td className="border px-4 py-2">{player}</td>
                                <td className="border px-4 py-2">{score}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button
                    onClick={() => router.push('/')}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                    Retourner à l'Accueil
                </button>
            </div>
        );
    }

    if (roundFinished) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
                <h2 className="text-2xl font-bold mb-4">Que voulez-vous faire ?</h2>
                <button
                    onClick={continueGame}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg mt-4"
                >
                    Continuer la Partie
                </button>
                <button
                    onClick={stopGame}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg mt-4"
                >
                    Stopper la Partie
                </button>
            </div>
        );
    }

    if (!gameOver) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
                <h2 className="text-xl font-semibold mb-4">Joueur : {players[currentPlayerIndex]}</h2>
                {wordToShow ? (
                    <div className="text-center">
                        <p className="text-lg mb-4">Votre mot est : <strong>{wordToShow}</strong></p>
                        <button 
                            onClick={nextPlayer} 
                            className="bg-green-500 text-white px-4 py-2 rounded-lg"
                        >
                            Joueur Suivant
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={showWord} 
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                    >
                        Révéler le mot
                    </button>
                )}
            </div>
        );
    } else {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
                <h2 className="text-2xl font-bold mb-4">Votez pour l'Imposteur</h2>
                <ul className="w-full max-w-md">
                    {players.map((player, index) => (
                        <li 
                            key={index} 
                            className={`bg-white p-2 my-2 rounded-lg shadow-sm cursor-pointer ${
                                selectedPlayer === player ? '!bg-red-200' : ''
                            }`}
                            onClick={() => handleVote(player)}
                        >
                            {player}
                        </li>
                    ))}
                </ul>
                <button 
                    onClick={revealImpostor} 
                    className="bg-red-500 text-white px-4 py-2 rounded-lg mt-4"
                    disabled={!selectedPlayer}
                >
                    Révéler l'Imposteur
                </button>
            </div>
        );
    }
}