// src/components/ExpandedAttackDetails.tsx
import React from "react";
import {
    User,
    Target,
    Globe,
    Shield,
    DollarSign,
    Activity,
    FileText,
    Mail,
    Lock,
} from "lucide-react";
import { Attack, displayField, displayNumericField } from "../types/Attack";

interface ExpandedAttackDetailsProps {
    attack: Attack;
}

const ExpandedAttackDetails = ({ attack }: ExpandedAttackDetailsProps) => {
    return (
        <tr className="bg-gray-50">
            <td colSpan={8} className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Attacker Details Section */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <User className="h-5 w-5 text-blue-600" />
                            <span>Attacker Details</span>
                        </h3>
                        <div className="space-y-2">
                            <div>
                                <p className="text-sm text-gray-500 flex items-center gap-1"><User className="h-4 w-4" /> Name:</p>
                                <p className="text-sm font-medium">{displayField(attack.attacker.attackerName)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 flex items-center gap-1"><Mail className="h-4 w-4" /> Email:</p>
                                <p className="text-sm font-medium">{displayField(attack.attacker.email)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 flex items-center gap-1"><Lock className="h-4 w-4" /> Tox ID:</p>
                                <p className="text-sm font-medium">{displayField(attack.attacker.toxId)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Description:</p>
                                <p className="text-sm font-medium">{displayField(attack.attacker.description)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Victim Details Section */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <Target className="h-5 w-5 text-red-600" />
                            <span>Victim Details</span>
                        </h3>
                        <div className="space-y-2">
                            <div>
                                <p className="text-sm text-gray-500">Name:</p>
                                <p className="text-sm font-medium">{displayField(attack.victim.victimName)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 flex items-center gap-1"><Globe className="h-4 w-4" /> Country:</p>
                                <p className="text-sm font-medium">{displayField(attack.victim.country)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Description:</p>
                                <p className="text-sm font-medium">{displayField(attack.victim.description)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">URL:</p>
                                <p className="text-sm font-medium">{displayField(attack.victim.victimURL)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 flex items-center gap-1"><DollarSign className="h-4 w-4" /> Revenue:</p>
                                <p className="text-sm font-medium">{displayNumericField(attack.victim.revenue)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Attack Details Section */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <Shield className="h-5 w-5 text-indigo-600" />
                            <span>Attack Details</span>
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-500">Negotiated:</p>
                                <p className="text-sm font-medium">{attack.isNegotiated ? "Yes" : "No"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Ransom Amount:</p>
                                <p className="text-sm font-medium">{displayField(attack.ransomAmount)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Attack Description:</p>
                                <p className="text-sm font-medium">{displayField(attack.description)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Statistics Section */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <Activity className="h-5 w-5 text-purple-600" />
                            <span>Statistics</span>
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-500">Visits:</p>
                                <p className="text-sm font-medium">{displayNumericField(attack.noOfVisits)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Data Size:</p>
                                <p className="text-sm font-medium">{displayField(attack.dataSizes)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Last Visited:</p>
                                <p className="text-sm font-medium">{displayField(attack.lastVisitedAt)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Updated At:</p>
                                <p className="text-sm font-medium">{displayField(attack.updatedAt)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Download URLs Section */}
                    {attack.downloadUrls?.length > 0 && (
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-blue-600" />
                                <span>All Available URLs ({attack.downloadUrls?.length})</span>
                            </h3>
                            <div className="space-y-2">
                                {attack.downloadUrls?.map((url) => (
                                    <div key={url.downloadUrlId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                        <a
                                            href={url.downloadUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline truncate"
                                        >
                                            {url.downloadUrl}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Images Section */}
                    {attack.images?.length > 0 && (
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-blue-600" />
                                <span>All Images ({attack.images?.length})</span>
                            </h3>
                            <div className="space-y-2">
                                {attack.images?.map((img) => (
                                    <div key={img.imageId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                        {img.imageUrl ? (
                                            <a
                                                href={img.imageUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-blue-600 hover:underline truncate"
                                            >
                                                {img.imageUrl}
                                            </a>
                                        ) : (
                                            <span className="text-sm text-gray-500">
                                                Image ID {img.imageId} (No URL available)
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </td>
        </tr>
    );
};

export default ExpandedAttackDetails;