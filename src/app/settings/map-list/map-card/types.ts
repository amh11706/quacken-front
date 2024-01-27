export interface MapOption {
  id: number
  description: string,
  name: string,
  released: boolean
  userId: number
  username: string,
  tags?: string[],
  ratingAverage: number;
  ratingCount: number;
  ratingMine?: number;
  data?: number[][];
  createdAt: string;
}
