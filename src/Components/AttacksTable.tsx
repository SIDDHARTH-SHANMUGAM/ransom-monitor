// src/components/AttacksTable.tsx
import React from "react";
import {
    User,
    Target,
    Globe,
    Shield,
    Calendar,
    Clock,
    Activity,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { Attack, displayField } from "../types/Attack";
import AttackTableRow from "./AttackTableRow";
import ExpandedAttackDetails from "./ExpandedAttackDetails";

interface AttacksTableProps {
    filteredAttacks: Attack[];
    toggleExpandAttack: (attackId: number) => void;
    expandedAttack: number | null;
}

const AttacksTable = ({ filteredAttacks, toggleExpandAttack, expandedAttack }: AttacksTableProps) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-sm rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-blue-600" />
                                <span>Attacker</span>
                            </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                                <Target className="h-4 w-4 text-red-600" />
                                <span>Victim</span>
                            </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-green-600" />
                                <span>Country</span>
                            </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-indigo-600" />
                                <span>Category</span>
                            </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-red-600" />
                                <span>Posted</span>
                            </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-orange-600" />
                                <span>Deadline</span>
                            </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-purple-600" />
                                <span>Actions</span>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {filteredAttacks.length === 0 ? (
                        <tr>
                            <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                                No attacks found matching your filters
                            </td>
                        </tr>
                    ) : (
                        filteredAttacks.map((attack) => (
                            <React.Fragment key={attack.attackId}>
                                <AttackTableRow
                                    attack={attack}
                                    toggleExpandAttack={toggleExpandAttack}
                                    expandedAttack={expandedAttack}
                                />
                                {expandedAttack === attack.attackId && <ExpandedAttackDetails attack={attack} />}
                            </React.Fragment>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AttacksTable;