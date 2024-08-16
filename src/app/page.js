'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
    const [players, setPlayers] = useState([]);
    const [name, setName] = useState("");
    const router = useRouter();

    const addPlayer = () => {
        setPlayers([...players, name]);
        setName("");
    };

    const startGame = () => {
        localStorage.setItem('players', JSON.stringify(players));
        router.push('/game');
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
            <h1 className="text-2xl font-bold mb-4">Undercover Game</h1>
            <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Entrez le nom du joueur"
                className="border rounded-lg px-4 py-2 mb-4 w-full max-w-md"
            />
            <button 
                onClick={addPlayer} 
                className="bg-blue-500 text-white px-4 py-2 rounded-lg mb-4"
            >
                Ajouter un joueur
            </button>
            <ul className="w-full max-w-md">
                {players.map((player, index) => (
                    <li key={index} className="bg-white p-2 my-2 rounded-lg shadow-sm">
                        {player}
                    </li>
                ))}
            </ul>
            <button 
                onClick={startGame} 
                disabled={players.length < 3} 
                className="bg-green-500 text-white px-4 py-2 rounded-lg mt-4 disabled:bg-gray-400"
            >
                Démarrer le jeu
            </button>
            <button 
                onClick={() => router.push('/words')} 
                className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded-lg"
            >
                Consulter la liste des mots
            </button>
        </div>
    );
}