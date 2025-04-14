import React from "react";
import { 
  ChevronUp, 
  Globe, 
  User,
  Target, 
  FileText,
  Image
} from "lucide-react";

interface Attack {
  attackId: number;
  attacker: {
    attackerName: string;
    email: string;
    toxId: string;
    description: string;
  };
  victim: {
    victimName: string;
    country: string;
    description: string;
    victimURL: string;
    revenue: number;
  };
  deadlines: string;
  isPublished: boolean;
  isForSale: boolean;
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
  downloadUrls: {
    downloadUrlId: number;
    downloadUrl: string;
  }[];
  images: {
    imageId: number;
    image: string;
  }[];
}


interface AttackDetailsProps {
  attack: Attack;
  onBack: () => void;
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
  return value.toLocaleString();
};

const AttackDetails = ({ attack, onBack }: AttackDetailsProps) => {
  return (
    <div className="container mx-auto p-6">
      <button 
        onClick={onBack}
        className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-800"
      >
        <ChevronUp className="h-5 w-5 transform rotate-90" />
        Back to list
      </button>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Attack Details</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Attacker Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Attacker Information
            </h2>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {displayField(attack.attacker.attackerName)}</p>
              <p><span className="font-medium">Email:</span> {displayField(attack.attacker.email)}</p>
              <p><span className="font-medium">Tox ID:</span> {displayField(attack.attacker.toxId)}</p>
              <p><span className="font-medium">Description:</span> {displayField(attack.attacker.description)}</p>
            </div>
          </div>

          {/* Victim Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Target className="h-5 w-5 text-red-600" />
              Victim Information
            </h2>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {displayField(attack.victim.victimName)}</p>
              <p><span className="font-medium">Country:</span> {displayField(attack.victim.country)}</p>
              <p><span className="font-medium">URL:</span> {displayField(attack.victim.victimURL)}</p>
              <p><span className="font-medium">Revenue:</span> {displayNumericField(attack.victim.revenue)}</p>
              <p><span className="font-medium">Description:</span> {displayField(attack.victim.description)}</p>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-600" />
            Additional Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p><span className="font-medium">Posted At:</span> {displayField(attack.postedAt)}</p>
              <p><span className="font-medium">Deadline:</span> {displayField(attack.deadlines)}</p>
            </div>
            <div>
              <p><span className="font-medium">Category:</span> {displayField(attack.category)}</p>
              <p><span className="font-medium">Status:</span> {attack.isPublished ? "Published" : "Draft"}</p>
            </div>
            <div>
              <p><span className="font-medium">Ransom Amount:</span> {displayField(attack.ransomAmount)}</p>
              <p><span className="font-medium">Sale Amount:</span> {displayField(attack.saleAmount)}</p>
            </div>
          </div>
        </div>

        {/* Download URLs */}
        {attack.downloadUrls?.length > 0 && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              Download URLs ({attack.downloadUrls.length})
            </h2>
            <div className="space-y-2">
              {attack.downloadUrls.map(url => (
                <a 
                  key={url.downloadUrlId} 
                  href={url.downloadUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-blue-600 hover:underline break-all"
                >
                  {url.downloadUrl}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Images */}
        {attack.images?.length > 0 && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Image className="h-5 w-5 text-purple-600" />
              Images ({attack.images.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {attack.images.map(img => (
                <div key={img.imageId} className="border rounded overflow-hidden">
                  {img.image && (
                    <img 
                      src={img.image} 
                      alt={`Attack evidence ${img.imageId}`}
                      className="w-full h-auto object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/150?text=Image+Not+Available';
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttackDetails;