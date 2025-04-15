import React, { useEffect, useState } from "react";
 import {
  ExternalLink,
  User,
  Target,
  Globe,
  Shield,
  Calendar,
  Clock,
  DollarSign,
  Activity,
  FileText,
  Mail,
  Lock,
  Eye,
 } from "lucide-react";
 import axios from "axios";
 import { useNavigate, useParams } from "react-router-dom";

 interface DownloadUrl {
  downloadUrlId: number;
  downloadUrl: string;
 }

 interface Image {
  imageId: number;
  imageUrl: string;
 }

 interface Attacker {
  attackerId: number;
  attackerName: string;
  email: string;
  toxId: string;
  description: string;
 }

 interface Victim {
  victimName: string;
  country: string;
  description: string;
  victimURL: string;
  revenue: number;
 }

 interface Attack {
  attackId: number;
  attacker: Attacker;
  victim: Victim;
  deadlines: string;
  postedAt: string;
  noOfVisits: number;
  dataSizes: string;
  description: string;
  lastVisitedAt: string;
  category: string;
  isNegotiated: boolean;
  ransomAmount: string;
  saleAmount: string;
  updatedAt: string;
  downloadUrls: DownloadUrl[];
  images: Image[];
 }

 const displayField = (value: any) => {
  if (value === null || value === undefined || value === "" || value === "Not Mentioned") {
   return "N/A";
  }
  return value;
 };

 const displayNumericField = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
   return "N/A";
  }
  return value?.toLocaleString();
 };

 interface AttackWithVisibility extends Attack {
  showDetails: boolean;
 }

 function ViewAttacks() {
  const { attackerId } = useParams<{ attackerId: string }>();
  const navigate = useNavigate();
  const [attacks, setAttacks] = useState<AttackWithVisibility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attackerDetails, setAttackerDetails] = useState<Attacker | null>(null);

  useEffect(() => {
   const fetchAttacksByAttackerId = async () => {
    setLoading(true);
    setError("");
    try {
     const response = await axios.post<Attack[]>(
      "http://localhost:3000/server/ransommonitor/getAttacksByAttackerId",
      { attackerId } // pass it in the POST body
     );
     const attacksWithVisibility = response.data.map((attack) => ({ ...attack, showDetails: false }));
     setAttacks(attacksWithVisibility);
     console.log(response.data);
     if (response.data.length > 0) {
      setAttackerDetails(response.data[0].attacker);
     }
    } catch (err) {
     setError(`Failed to fetch attacks for Attacker ID: ${attackerId}`);
     console.error("Error fetching attacks:", err);
    } finally {
     setLoading(false);
    }
   };

   fetchAttacksByAttackerId();
  }, [attackerId]);

  const toggleDetails = (attackId: number) => {
   setAttacks((prevAttacks) =>
    prevAttacks.map((attack) =>
     attack.attackId === attackId ? { ...attack, showDetails: !attack.showDetails } : attack
    )
   );
  };

  if (loading) {
   return (
    <div className="container mx-auto p-6 flex justify-center items-center h-64">
     <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
   );
  }

  if (error) {
   return (
    <div className="container mx-auto p-6">
     <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong className="font-bold">Error! </strong>
      <span className="block sm:inline">{error}</span>
     </div>
     <button onClick={() => navigate("/app/monitor")} className="btn btn-secondary mt-4">
      Back to Monitor
     </button>
    </div>
   );
  }

  return (
   <div className="container mx-auto p-6 max-w-full">
    <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg shadow-sm border border-gray-200">
     <h1 className="text-xl font-semibold text-gray-900">
      Attacks by {attackerDetails?.attackerName ? displayField(attackerDetails.attackerName) : `Attacker ID: ${attackerId}`}
     </h1>
    </div>

    {attackerDetails && (
     <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
       <User className="h-5 w-5 text-blue-600" />
       Attacker Details
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
       <div>
        <p className="text-sm text-gray-500 flex items-center gap-1">
         <User className="h-4 w-4" /> Name:
        </p>
        <p className="text-sm font-medium">{displayField(attackerDetails.attackerName)}</p>
       </div>
       <div>
        <p className="text-sm text-gray-500 flex items-center gap-1">
         <Mail className="h-4 w-4" /> Email:
        </p>
        <p className="text-sm font-medium">{displayField(attackerDetails.email)}</p>
       </div>
       <div>
        <p className="text-sm text-gray-500 flex items-center gap-1">
         <Lock className="h-4 w-4" /> Tox ID:
        </p>
        <p className="text-sm font-medium">{displayField(attackerDetails.toxId)}</p>
       </div>
       <div>
        <p className="text-sm text-gray-500">Description:</p>
        <p className="text-sm font-medium">{displayField(attackerDetails.description)}</p>
       </div>
      </div>
     </div>
    )}

    {attacks.length === 0 ? (
     <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
      <span className="block sm:inline">No attacks found for Attacker ID: {attackerId}.</span>
     </div>
    ) : (
     <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
       <thead className="bg-gray-50">
        <tr>
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
           <DollarSign className="h-4 w-4 text-lime-600" />
           <span>Ransom</span>
          </div>
         </th>
         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="flex items-center gap-2">
           <DollarSign className="h-4 w-4 text-yellow-600" />
           <span>Sale Price</span>
          </div>
         </th>
         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="flex items-center gap-2">
           <Activity className="h-4 w-4 text-purple-600" />
           <span>Visits</span>
          </div>
         </th>
         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="flex items-center gap-2">
           <FileText className="h-4 w-4 text-gray-600" />
           <span>Data Size</span>
          </div>
         </th>
         <th className="relative px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          <span className="sr-only">View Details</span>
         </th>
        </tr>
       </thead>
       <tbody className="divide-y divide-gray-200">
        {attacks.map((attack) => (
         <tr key={attack.attackId} className="hover:bg-gray-50">
          <td className="px-6 py-4 whitespace-normal">
           <div className="font-medium text-red-700">{displayField(attack.victim?.victimName || "Unknown")}</div>
           <a
            href={attack.victim.victimURL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
           >
            <ExternalLink className="h-3 w-3" />
            {displayField(
             attack.victim.victimURL.length > 30 ? `${attack.victim.victimURL.substring(0, 30)}...` : attack.victim.victimURL
            )}
           </a>
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
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
            }`}
           >
            {displayField(attack.deadlines)}
           </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">{displayField(attack.ransomAmount)}</td>
          <td className="px-6 py-4 whitespace-nowrap">{displayField(attack.saleAmount)}</td>
          <td className="px-6 py-4 whitespace-nowrap">{displayNumericField(attack.noOfVisits)}</td>
          <td className="px-6 py-4 whitespace-nowrap">{displayField(attack.dataSizes)}</td>
          <td className="px-6 py-4 whitespace-nowrap text-right">
           <button
            onClick={() => toggleDetails(attack.attackId)}
            className="text-indigo-600 hover:text-indigo-900 focus:outline-none"
           >
            <Eye className="h-5 w-5" />
           </button>
          </td>
         </tr>
        ))}
       </tbody>
      </table>
     </div>
    )}

    {attacks.map((attack) => (
     attack.showDetails && (
      <div key={`details-${attack.attackId}`} className="mt-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
       <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Target className="h-5 w-5 text-red-600" />
        Victim Details
       </h2>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
         <p className="text-sm text-gray-500 flex items-center gap-1">
          <User className="h-4 w-4" /> Name:
         </p>
         <p className="text-sm font-medium">{displayField(attack.victim?.victimName)}</p>
        </div>
        <div>
         <p className="text-sm text-gray-500 flex items-center gap-1">
          <Globe className="h-4 w-4" /> Country:
         </p>
         <p className="text-sm font-medium">{displayField(attack.victim?.country)}</p>
        </div>
        <div>
         <p className="text-sm text-gray-500">Description:</p>
         <p className="text-sm font-medium">{displayField(attack.victim?.description)}</p>
        </div>
        <div>
         <p className="text-sm text-gray-500 flex items-center gap-1">
          <ExternalLink className="h-4 w-4" /> Victim URL:
         </p>
         <a
          href={attack.victim?.victimURL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-blue-600 hover:underline"
         >
          {displayField(attack.victim?.victimURL)}
         </a>
        </div>
        <div>
         <p className="text-sm text-gray-500 flex items-center gap-1">
          <DollarSign className="h-4 w-4" /> Revenue:
         </p>
         <p className="text-sm font-medium">{displayNumericField(attack.victim?.revenue)}</p>
        </div>
       </div>

       {attack.downloadUrls?.length > 0 && (
        <div className="mb-4">
         <h3 className="text-md font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-600" />
          Download URLs
         </h3>
         <div className="space-y-2">
          {attack.downloadUrls.map((url) => (
           <a
            key={url.downloadUrlId}
            href={url.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
           >
            <ExternalLink className="h-3 w-3" />
            {displayField(url.downloadUrl)}
           </a>
          ))}
         </div>
        </div>
       )}

       {attack.images?.length > 0 && (
        <div>
         <h3 className="text-md font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-600" />
          Images
         </h3>
         <div className="flex flex-wrap gap-2">
          {attack.images.map((img) => (
           <img
           key={img.imageId}
            src={img.imageUrl}
            alt={`Attack Image ${img.imageId}`}
            className="h-20 w-auto rounded border"
           />
          ))}
         </div>
        </div>
       )}
      </div>
     )
    ))}

    <button onClick={() => navigate("/app/monitor")} className="btn btn-secondary mt-6">
     Back to Monitor
    </button>
   </div>
  );
 }

 export default ViewAttacks;