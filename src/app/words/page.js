'use client';

import { useEffect, useState } from 'react';
import { readExcelFile } from '../../utils/readExcel';

export default function WordsList() {
    const [words, setWords] = useState([]);

    useEffect(() => {
        const fetchWords = async () => {
            const wordsData = await readExcelFile('/undercover_mots_francais.xlsx');
            setWords(wordsData);
        };

        fetchWords();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
            <h1 className="text-2xl font-bold mb-4">Liste des Mots</h1>
            <table className="table-auto bg-white shadow-md rounded-lg">
                <thead>
                    <tr>
                        <th className="px-4 py-2">Mot Commun</th>
                        <th className="px-4 py-2">Mot Undercover</th>
                    </tr>
                </thead>
                <tbody>
                    {words.map(([commonWord, undercoverWord], index) => (
                        <tr key={index}>
                            <td className="border px-4 py-2">{commonWord}</td>
                            <td className="border px-4 py-2">{undercoverWord}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button
                onClick={() => window.history.back()}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
                Retour
            </button>
        </div>
    );
}