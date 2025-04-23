
export interface DownloadUrl {
  downloadUrlId: number;
  downloadUrl: string;
}

export interface Image {
  imageId: number;
  imageUrl: string;
}

export interface Attacker {
  attackerName: string;
  email: string;
  toxId: string;
  description: string | null;
}

export interface Victim {
  victimName: string;
  country: string;
  description: string | null;
  victimURL: string | null;
  revenue: number | null;
}

export interface Attack {
  attackId: number;
  attacker: Attacker;
  victim: Victim;
  deadlines: string | null;
  postedAt: string | null;
  noOfVisits: number | null;
  dataSizes: string | null;
  description: string | null;
  lastVisitedAt: string | null;
  category: string | null;
  isNegotiated: boolean | null;
  ransomAmount: string | null;
  updatedAt: string | null;
  downloadUrls: DownloadUrl[];
  images: Image[];
}

export interface Filters {
  attackerName: string;
  country: string;
  createdStart: string;
  createdEnd: string;
  category: string;
}

export const displayField = (value: any) => {
  if (value === null || value === undefined || value === "" || value === "Not Mentioned") {
      return "N/A";
  }
  return value;
};

export const displayNumericField = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
      return "N/A";
  }
  return value?.toLocaleString();
};