export interface Tool {
  _id: string;
  name: string;
  description: string;
  dailyPrice: number;
  category: string;
  location: string;
  imageUrl?: string;
  isInsured: boolean;
  rating?: number;
  rentalCount?: number;
  status: "available" | "unavailable";
  owner?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}
