// user.model.ts

import { Stock } from './stock.model';

export interface User {
  _id?: string;  // Optional, used for MongoDB's default ID
  username: string;
  email: string;
  balance: number;  // Represents the amount of money the user has for trading
  portfolio: Stock[];  // Array of stocks the user owns
}
