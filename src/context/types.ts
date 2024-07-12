  export interface User {
    userid: number;
    username: string;
  }
  
  export interface AuthContextType {
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
  }
  