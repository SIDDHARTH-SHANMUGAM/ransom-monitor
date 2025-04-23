// src/components/AttackTableRow.tsx
import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Attack, displayField } from "../types/Attack";

interface AttackTableRowProps {
    attack: Attack;
    toggleExpandAttack: (attackId: number) => void;
    expandedAttack: number | null;
}

const AttackTableRow = ({ attack, toggleExpandAttack, expandedAttack }: AttackTableRowProps) => {
    return (
        <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleExpandAttack(attack.attackId)}>
            <td className="px-6 py-4">
                <div className="font-medium text-blue-700">{displayField(attack.attacker.attackerName)}</div>
            </td>
            <td className="px-6 py-4">
                <div className="font-medium text-red-700">{displayField(attack.victim.victimName)}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    {displayField(attack.victim.country)}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">{displayField(attack.category)}</td>
            <td className="px-6 py-4 whitespace-nowrap">{displayField(attack.postedAt)}</td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span
                    className={`px-2 py-1 text-xs rounded-full ${
                        attack.deadlines && new Date(attack.deadlines) < new Date()
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                    }`}
                >
                    {displayField(attack.deadlines)}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleExpandAttack(attack.attackId);
                    }}
                    className="btn btn-secondary btn-sm"
                >
                    {expandedAttack === attack.attackId ? (
                        <ChevronUp className="h-4 w-4" />
                    ) : (
                        <ChevronDown className="h-4 w-4" />
                    )}
                </button>
            </td>
        </tr>
    );
};

export default AttackTableRow;