import { User } from '../types';
import { DEFAULT_USERS } from '../data/users';

const USERS_KEY = 'scriptgen_users';
const CURRENT_USER_KEY = 'scriptgen_current_user';

class AuthService {
  
  async initialize(): Promise<void> {
    if (!localStorage.getItem(USERS_KEY)) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
    }
  }

  private getLocalUsers(): User[] {
    const usersJson = localStorage.getItem(USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  }

  private saveLocalUsers(users: User[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  async getUsers(): Promise<User[]> {
    return this.getLocalUsers();
  }
  
  async getUserById(userId: string): Promise<User | null> {
    const users = this.getLocalUsers();
    return users.find(u => u.id === userId) || null;
  }

  async login(usernameOrEmail: string, password: string): Promise<User | null> {
    const users = this.getLocalUsers();
    const user = users.find(
      u => u.username.toLowerCase() === usernameOrEmail.toLowerCase()
    );
    
    // Check password for local auth
    if (user && user.password === password && user.status === 'active') {
        // Create a copy of the user object without the password to store in the session
        const { password: userPassword, ...userWithoutPassword } = user;
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
        return userWithoutPassword;
    }
    return null;
  }

  async logout(): Promise<void> {
    localStorage.removeItem(CURRENT_USER_KEY);
  }

  async getCurrentUser(): Promise<User | null> {
    const userJson = localStorage.getItem(CURRENT_USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  onAuthStateChange(callback: (event: string, session: any | null) => void) {
    // Mock subscription for local mode, does nothing.
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
  
  async updateUser(user: User): Promise<void> {
    let users = this.getLocalUsers();
    const index = users.findIndex(u => u.id === user.id);
    if(index !== -1) {
        users[index] = user;
        this.saveLocalUsers(users);
    }
  }

  async addUsers(usersToAdd: User[]): Promise<void> {
    const existingUsers = this.getLocalUsers();
    const updatedUsers = [...existingUsers, ...usersToAdd];
    this.saveLocalUsers(updatedUsers);
  }

}

export const authService = new AuthService();